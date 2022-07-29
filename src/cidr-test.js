const IPCIDR = require("ip-cidr");

const addr = "81.173.231.195"
// const addr = "2001:4dd0:af8f::cb6"

let cidr = IPCIDR.createAddress(addr)
console.log(cidr.address + cidr.subnet)
