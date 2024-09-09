--- NEED REWRITE IF APP IS READY ---



# ddns-broker
Dynamic DNS Broker Application

## Environment

Application process an .env file.

Default Values:

```
NODE_ENV=testing
LOG_LEVEL=info
CONFIG_FILE=config.yaml
HTTP_HOST=0.0.0.0
HTTP_PORT=3000
```

## Configuration

Configuration must be saved as an yaml file.

Example:

```
---
accounts:
  - username: max.mustermann
    password: verysecretpassword
    hostnames:
      - name: mydomain.com
        provider:
          name: inwx
          auth:
            username: inwx-username
            password: inwx-password
      - name: mydomain.org
        provider:
          name: godaddy
          auth:
            key: godaddy-app-key
            secret: godaddy-app-secret
```

## DynDNS Client Call

```
http://<HTTP_HOST>:<HTTP_PORT>/update?hostname=mydomain.com&ip=1.1.1.1&ipv6=2002:4dd0:100:1020:53:2::1
```
