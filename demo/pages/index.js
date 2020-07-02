import { Socket } from '@supabase/realtime-js';
import axios from 'axios';
import Modal from 'react-modal';

const REALTIME_URL = process.env.REALTIME_URL || 'ws://127.0.0.1:4000/socket'
const PUBLIC_HOST = process.env.PUBLIC_HOST || '127.0.0.1'

const config = {
    headers: {
        common: {
            'Content-Type': 'application/json',
            // 'Authorization:': 'Bearer {{token}}'
        }
    }
};


const modalStyles = {
    content : {
        top: '15%',
        left: '15%',
        right: '15%',
        bottom: 'auto',
        maxHeight: '70%'
        // marginRight: '-50%',
        // transform: 'translate(-50%, -50%)'
    }
};

const styles = {
    main: { fontFamily: 'monospace', height: '100%', margin: 0, padding: 0 },
    link: {
        color: 'blue',
        textDecoration: 'underline',
        cursor: 'pointer'
    },
    pre: {
        whiteSpace: 'pre',
        overflow: 'auto',
        background: '#333',
        maxHeight: 200,
        borderRadius: 6,
        padding: 5,
    },
    code: { display: 'block', wordWrap: 'normal', color: '#fff' },
    row: { display: 'flex', flexDirection: 'row', height: '100%' },
    col: { width: '33%', maxWidth: '33%', padding: 10, height: '100%', overflow: 'auto' },
    modalWrapper: {},
    modal: {}
};

export default class Index extends React.Component {
    constructor() {
        super()
        this.state = {
            received: [],
            socketState: 'CONNECTING',
            users: [],
            accounts: [],
            modalOpen: false
        }
        this.messageReceived = this.messageReceived.bind(this)

        this.socket = new Socket(REALTIME_URL)
        this.channelList = []
    }

    componentDidMount() {
        this.socket.connect()
        this.addChannel('realtime:*')
        this.addChannel('realtime:public:accounts')
        this.addChannel('realtime:public:users')
//        this.addChannel('realtime:public:users:id=eq.2')
        this.fetchData()
    }

    addChannel(topic) {
        let channel = this.socket.channel(topic);

        ['INSERT', 'UPDATE'].forEach((event) => {
            channel.on(event, async (msg) => {
                let immuresponse;

                if (topic === 'realtime:*') {
                    const tableName = msg.table;

                    let id;
                    let value;
                    if (tableName === 'users') {
                        id = msg.record.id;
                        value = msg.record.name;
                    } else {
                        id = msg.record.user_id;
                        value = msg.record.account;
                    }

                    const data = {
                        key: new Buffer(`${tableName}:${id}`).toString('base64'),
                        value: new Buffer(value).toString('base64')
                    };

                    const response = await axios.post(`http://${PUBLIC_HOST}:3323/v1/immurestproxy/item`, data, config);

                    immuresponse = response.data;
                    immuresponse.index = immuresponse.index || 0;
                }

                return this.messageReceived(topic, msg, immuresponse)
            });
        });


        // channel.on('*', msg => console.log('INSERT', msg))
        // channel.on('INSERT', msg => console.log('INSERT', msg))
        // channel.on('UPDATE', msg => console.log('UPDATE', msg))
        // channel.on('DELETE', msg => console.log('DELETE', msg))
        channel
              .join()
              .receive('ok', () => console.log('Connecting'))
              .receive('error', () => console.log('Failed'))
              .receive('timeout', () => console.log('Waiting...'))
        this.channelList.push(channel)
    }

    messageReceived(channel, msg, immuresponse) {
        if (channel === 'realtime:*') {
            this.setState({ received: [{ channel, msg, immuresponse }, ...this.state.received] })
        }

        if (channel === 'realtime:public:users') {
            this.setState({ users: [msg.record, ...this.state.users] })
        }

        if (channel === 'realtime:public:accounts') {
            this.setState({ accounts: [msg.record, ...this.state.accounts] })
        }
    }

    async fetchData() {
        try {
            let { data: users } = await axios.get('/api/fetch/users');
            let { data: accounts } = await axios.get('/api/fetch/accounts');

            this.setState({ users: users.reverse(), accounts: accounts.reverse() });
        } catch (error) {
            console.log('error', error);
        }
    }

    async insertUser() {
        let { data: user } = await axios.post('/api/new-user', {});
    }

    async insertAccount() {
        let { data: account } = await axios.post('/api/new-account', {});
    }

    trimSpecial(string) {
        return string.replace(/[^\w ]/g, '');
    }

    async openModal(immudbIndex) {
        const itemResponse = await axios.get(`http://${PUBLIC_HOST}:3323/v1/immurestproxy/item/index/${immudbIndex}`, config);
        const key = itemResponse.data.key;

        const data = {
            key,
        };

        const safeGetResponse = await axios.post(`http://${PUBLIC_HOST}:3323/v1/immurestproxy/item/safe/get`, data, config);
        const historyResponse = await axios.get(`http://${PUBLIC_HOST}:3323/v1/immurestproxy/history/${key}`, config);

        this.setState({
            modalOpen: true,
            immudbItem: JSON.stringify({
                ...itemResponse.data,
                key: Buffer.from(itemResponse.data.key, 'base64').toString('utf-8'),
                value: this.trimSpecial(Buffer.from(itemResponse.data.value, 'base64').toString('utf-8')),
            }, null, 2),
            immudbSafeGet: JSON.stringify({
                ...safeGetResponse.data,
                key: Buffer.from(itemResponse.data.key, 'base64').toString('utf-8'),
                value: this.trimSpecial(Buffer.from(itemResponse.data.value, 'base64').toString('utf-8')),
            }, null, 2)
                .replace(`"verified": true`, `<span class="bg-success p-1 rounded">"verified": true</span>`)
                .replace(`"verified": false`, `<span class="bg-danger p-1 rounded">"verified": false</span>`),
            immudbHistory: JSON.stringify({
                ...historyResponse.data,
                items: historyResponse.data.items.map((item) => ({
                    ...item,
                    key: Buffer.from(item.key, 'base64').toString('utf-8'),
                    value: {
                        ...item.value,
                        payload: Buffer.from(item.value.payload, 'base64').toString('utf-8'),
                    }
                }))
            }, null, 2)
        });
    }

    closeModal() {
        this.setState({
            modalOpen: false,
            immudbItem: null,
            immudbSafeGet: null,
            historyResponse: null
        });
    }

    render() {
        return (
                <div className="container-fluid">
                    <Modal
                        isOpen={this.state.modalOpen}
                        // onAfterOpen={afterOpenModal}
                        // onRequestClose={closeModal}
                        style={modalStyles}
                        ariaHideApp={false}
                        shouldCloseOnOverlayClick={true}
                        contentLabel="Example Modal">

                        <div className="row">
                            <div className="col d-flex justify-content-between">
                                <h1>immudb</h1>
                                <button className="btn btn-dark" style={{ width: '60px' }} onClick={() => this.closeModal()}>x</button>
                            </div>
                        </div>

                        <hr/>

                        <div className="row">
                            <div className="col">
                                <h3>Index</h3>
                                <p>Retrieve immudb entry by index</p>
                                <pre style={styles.pre}>
                                    <code style={{ ...styles.code, minHeight: '147px' }}>{this.state.immudbItem}</code>
                                </pre>
                            </div>
                            <div className="col">
                                <h3>Safe Get</h3>
                                <p>Retrieve immudb entry by using safe get</p>
                                <pre style={styles.pre}>
                                    <code style={styles.code} dangerouslySetInnerHTML={{ __html: this.state.immudbSafeGet }}></code>
                                </pre>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <h3>History</h3>
                                <p>Immudb entry history</p>
                                <pre style={{ ...styles.pre, minHeight: '300px' }}>
                                    <code style={styles.code}>{this.state.immudbHistory}</code>
                                </pre>
                            </div>
                        </div>
                    </Modal>

                    <div className="row align-items-center">
                        <div className="col">
                            <img src="https://immudb.io/mascot.png" height="150"/>
                            <h1>immudb.io audit</h1>
                            <p>Watching database changes in realtime</p>
                        </div>
                        <div className="col">
                            <h2>Users</h2>
                            <button className="btn btn-primary" onClick={() => this.insertUser()}>Add user</button>
                        </div>
                        <div className="col">
                            <h2>Bank Accounts</h2>
                            <button className="btn btn-primary" onClick={() => this.insertAccount()}>Add account</button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            {this.state.received.map((x, index) => (
                                <div className="card mb-2" key={index}>
                                    <div className="card-body p-2">
                                        <p className="mb-2">
                                            Received on {x.channel} / immutably stored by immudb:
                                            <a style={styles.link} onClick={() => this.openModal(x.immuresponse.index)}>index {x.immuresponse.index}</a>
                                        </p>
                                        <pre style={styles.pre} className="mb-0">
                                            <code style={styles.code}>{JSON.stringify(x.msg, null, 2)}</code>
                                        </pre>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="col">
                            {this.state.users.map(user => (
                                <div className="card mb-2" key={user.id}>
                                    <div className="card-body p-2">
                                        <pre style={styles.pre} className="mb-0">
                                            <code style={styles.code}>{JSON.stringify(user, null, 2)}</code>
                                        </pre>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="col">
                            {this.state.accounts.map(account => (
                                <div className="card mb-2" key={account.account}>
                                    <div className="card-body p-2">
                                        <pre style={styles.pre} className="mb-0">
                                            <code style={styles.code}>{JSON.stringify(account, null, 2)}</code>
                                        </pre>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
        )
    }
}

