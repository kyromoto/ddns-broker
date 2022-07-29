const axios = require('axios')

class Hcloud {
    constructor(token) {
        this.url = "https://api.hetzner.cloud/v1"
        this.token = token
        this.headerConfig = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }

    async getFirewallByName(name) {
        const url = this.url + `/firewalls?name=${name}`
        const res = await axios.get(url, { headers: this.headerConfig })

        const firewalls = res.data.firewalls.filter(firewall => firewall.name === name)

        if(firewalls.length > 1) {
            throw new Error(`Found more then 1 entry with name ${name}`)
        }

        if(firewalls.length < 1) {
            throw new Error(`Entry with name ${name} not found`)
        }
        
        return {
            "firewall" : firewalls[0]
        }
    }

    async getFirewallById(id) {
        const url = this.url + `/firewalls/${id}`
        const res = await axios.get(url, { headers: this.headerConfig })
        return res.data
    }

    async setFirewallRules(id, rules) {
        const url = this.url + `/firewalls/${id}/actions/set_rules`
        const body = JSON.stringify({ rules : rules })
        const res = await axios.post(url, body, { headers: this.headerConfig })
        return res.data
    }
}

module.exports = Hcloud