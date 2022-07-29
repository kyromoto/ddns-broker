const axios = require('axios')
const IPCIDR = require("ip-cidr")
const Hcloud = require('./hcloudClient')

class Provider {
    constructor(loggerFactory, messageQueue) {     
        this.logger = loggerFactory.createServiceLogger('Hetzner Cloud Firewall Provider')
        this.messageQueue = messageQueue
    }

    init() {
        this.messageQueue.registerQueue('hcloud_firewall', 1, async (job, callback) => {
            const { correlationId, fqdn, ips, action} = job
            const { token } = action.auth
            const firewalls = action.firewalls

            const cidr_ips = ips.map(ip => {
                const cidr = IPCIDR.createAddress(ip)
                return cidr.address + cidr.subnet
            })

            firewalls.forEach(firewall => {
                const payload = { correlationId: correlationId, ips: cidr_ips, firewall: firewall, token: token, fqdn: fqdn }
                this.messageQueue.emit('message', { queue: 'hcloud_firewall_exec', payload: payload })

                this.logger.info({ message: `Job emitted for hcloud firewall ${firewall.name} of ${fqdn}`, cid: correlationId, fqdn: fqdn })
            })

            return callback(undefined, 'OK')
        })

        this.messageQueue.registerQueue('hcloud_firewall_exec', 1, async (job, callback) => {
            const { ips, firewall, token, correlationId, fqdn } = job
            
            try {
                const hcloud = new Hcloud(token, this.logger)

                const currentFirewall = await hcloud.getFirewallByName(firewall.name, null, 2)

                this.logger.debug({ message: JSON.stringify(currentFirewall), cid: correlationId, fqdn: fqdn, firewall: firewall.name })
                
                const currentFirewallRules = currentFirewall.firewall.rules
                const updatedFirewallRules = currentFirewallRules.map(rule => {
                    const filtered = firewall.rules.filter(firewall_rule => rule.description == firewall_rule)
                    
                    if(filtered.length == 0) {
                        return rule
                    }

                    const new_rule = JSON.parse(JSON.stringify(rule))
                    new_rule.source_ips = ips
                    return new_rule
                })

                this.logger.debug({ message: JSON.stringify(updatedFirewallRules, null, 2), cid: correlationId, fqdn: fqdn, firewall: firewall.name })

                await hcloud.setFirewallRules(currentFirewall.firewall.id, updatedFirewallRules)
                return callback(undefined, 'OK')
            } catch(ex) {
                if(ex.response) {
                    this.logger.error({ message: ex.response.data, cid: correlationId })
                }
                this.logger.error({ message: ex.message, cid: correlationId })
                return callback(new Error(ex.message))
            }
        })
    }
}

module.exports = Provider