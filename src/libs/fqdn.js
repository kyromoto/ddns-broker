const Validator = require('validator')

const getIpType = function (ip) {    
    if(Validator.isIP(ip, 4)) {
        return "A"
    }
    
    if (Validator.isIP(ip, 6)) {
        return "AAAA"
    }

    throw new Error(`Ip is not valid. ${ip}`)
}

const getDomain = function (fqdn) {
    let splittedFQDN = fqdn.split('.');
  
    if (splittedFQDN.length < 2) {
        throw new Error(`FQDN could not be splitted. FQDN: ${fqdn}`)
    }

    if(splittedFQDN.length > 2) {
        splittedFQDN = splittedFQDN.splice(splittedFQDN.length - 2, 2)
    }
  
    return splittedFQDN.join('.')
}

const getHostname = function (fqdn) {
    let splittedFQDN = fqdn.split('.');
  
    if (splittedFQDN.length < 2) {
        throw new Error(`FQDN could not be splitted. FQDN: ${fqdn}`)
    }
  
    return splittedFQDN.splice(0, splittedFQDN.length - 2).join('.')
}

if(process.env.NODE_EN !== 'production') {
    const fqdns = ['host.ddns.domain.com', 'domain.com']

    fqdns.forEach(fqdn => {
        console.log(`getDomain(${fqdn}) => ${getDomain(fqdn)}`)
        console.log(`getHostname(${fqdn}) => ${getHostname(fqdn)}`)
    })
}

module.exports = {
    getDomain: getDomain,
    getHostname: getHostname,
    getIpType: getIpType
}