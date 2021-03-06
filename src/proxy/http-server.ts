import * as http from 'http';
import * as log from '../logger';
import db from '../data/connection';
import {get as getConfig} from '../api/configurations/get';
import getIP from './get-ip';
import * as HTTPProxy from 'http-proxy';
import closeAsync from './close';

var webServer: http.Server;
var proxyServer: http.Server & { web: any, ws: any };
var running: boolean = false;

const startServer = async(() => {
    if (running === true) return;
    log.info('Attempting to start HTTP proxy server...');
    let config = await(getConfig());
    const serverIp = await(getIP())
    webServer = http.createServer(requestHandler);
    webServer.listen(config.httpPort, serverIp, () => {
        proxyServer = HTTPProxy.createProxyServer({});

        proxyServer.on('error', error => {
            log.error('[PROXY] ' + error);
        });

        log.info('Started HTTP proxy server on ' + serverIp + ':' + config.httpPort);

    });

    webServer.on('upgrade', webSocketHandler);

    webServer.on('error', error => {
        log.error('Failed to start HTTP proxy server: ' + error);
    });
    
    running = true;
});

const stopServer = async((): void => {
    if (running === false) return;
    if (!webServer && !proxyServer) {
        return;
    }
    
    await(closeAsync(webServer));
    await(closeAsync(proxyServer));
    running = false;
});

export default { 
    startServer,
    stopServer,
}

export const restartServer = async(() => {
    var promise = new Promise<boolean>(resolve => {
        const closeHandler = () => {
            if (!proxyServer) return;
            proxyServer.close(() => {
                log.info('Proxy server suspended');
                resolve(true);
            });
        }
        webServer.close(closeHandler);
    }).then(startServer);
    return await(promise);
});

const webSocketHandler = async((request, socket, head) => {
    var info = getDomainInfo(request.headers.host);
    var container = await(getSubdomainContainer(info.subdomain));

    if (container.isProxying === 0) {
        // Contaier is not proxying, do not proxy
        return
    }

    if (container.port === 0) {
        // Container is not available, do not proxy
        return;
    }
    var target = getContainerUrl(container);
    proxyServer.ws(request, socket, head, { target });
});

function requestHandler(request, response) {
    //TODO: Container information should be kept in memory to remove DB call overhead
    var info = getDomainInfo(request.headers.host);

    getSubdomainContainer(info.subdomain)
        .then(container => {
            if (container.port === 0) {
                errorResponse(response, 'Container not available');
                return;
            }
            var targetUrl = getContainerUrl(container);
            proxyServer.web(request, response, {
                target: targetUrl
            });
        })
        .catch(error => errorResponse(response, error));
}

function errorResponse(response: any, error) {
    response.statusCode = 503;
    response.statusMessage = 'Service unavailable: ' + error;
    response.write('Service unavailable: ' + error);
    response.end();
}

function getDomainInfo(host: string) {
    if (!host) return { subdomain: '', domain: '' };
    var fullDomain = host.replace('https://', '').replace('http://', '').split(':')[0]; // Remove any port number

    var split = fullDomain.split('.');

    var subdomain = split[0].toLocaleLowerCase();
    var domain = split.slice(1).join('.').toLocaleLowerCase();

    return {
        subdomain: subdomain,
        domain: domain
    };
}

function getSubdomainContainer(subdomain: string): Promise<Concierge.Container> {
    return new Promise<Concierge.Container>((resolve, reject) => {
        db('Containers')
            .select()
            .where({ subdomain: subdomain })
            .then(containers => {
                if (containers.length === 0) return reject('No matching service found');
                if (containers[0].isProxying !== 1) return reject('Service is down for maintenance');

                resolve(containers[0]);
            }).catch(reject);
    });
}

function getContainerUrl(container: Concierge.Container) {
    var url = [
        'http://',
        container.host,
        ':',
        container.port
    ];

    return url.join('');
}