import getHosts = require('./hosts/get');
import DockerClient from 'dockerode-ts';

export default function getDockerClient(host: Concierge.Host, timeout?: number) {    
    if (!host.hostname) {
        throw new Error(`Invalid host provided: must container field 'hostname' (Typeof ${typeof host})`);
    }

    var dockerClient = new DockerClient({
        host: host.hostname,
        port: host.dockerPort || 2375,
        protocol: 'http',
        timeout: timeout || 0
    });

    return dockerClient;
}
