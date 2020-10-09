const axios = require('axios').default;

module.exports = async function(callback) {
    console.log("seeding creators")

    const accounts = await web3.eth.getAccounts()
    const creators = accounts.slice(5)

    console.log("got creators", creators)

    const api = axios.create({
        baseURL: 'http://localhost:8080',
        timeout: 1000,
    });

    console.log("starting seeder")
    const seeds = [
        {
            Account: creators[0],
            Bookmarks: [
                {
                    name: "Nick White YouTube",
                    url: "https://www.youtube.com/c/NickWhite",
                    tags: ["programming"]
                },
                {
                    name: "Dapp University",
                    url: "https://www.youtube.com/c/DappUniversity",
                    tags: ["programming"]
                }
            ]
        },
        {
            Account: creators[1],
            Bookmarks: [
                {
                    name: "Chainlink",
                    url: "https://www.youtube.com/c/ChainlinkOfficial",
                    tags: ["blockchain"]
                },
                {
                    name: "CS Dojo",
                    url: "https://www.youtube.com/channel/UCxX9wt5FWQUAAz4UrysqK9A",
                    tags: ["programming"]
                }
            ]
        },

    ]

    for (const s of seeds) {
        console.log('seeding', s)

        const res = await api.post(`/creators/${s.Account}/bookmarks`, s)
        console.log(res.status)
    }

    console.log('done')
    callback()
}

