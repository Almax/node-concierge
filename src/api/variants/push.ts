import getDockerClient from '../dockerClient';
import * as http from 'http';
import getRegistry from '../registry/getRegistry';
import * as log from '../../logger';
import * as getHosts from '../hosts/get';
import * as emitter from '../events/emitter';

/**
 * Push an Image onto the registry
 */
export default async((tagName: string, application: Concierge.Application, host: Concierge.Host) => {
    host = host || await(getHosts.all())[0];
    log.info('[PUSH] Attempting to push "' + tagName + '"');

    var pushResponses = await(pushToHost(host, application, tagName));
    return pushResponses;
});

function pushToHost(host: Concierge.Host, application: Concierge.Application, tagName: string) {

    const dockerClient = getDockerClient(host);
    const registry = await(getRegistry());
    const imageName = registry.getUntaggedImage(application);
    const image = dockerClient.getImage(imageName);

    var resolve, reject;
    const promise = new Promise<string[]>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    const pushResponses = [];

    const imageHandler = (error, response) => {
        if (error) return reject(error);
        response.on('data', data => onDataHandler(data, pushResponses, tagName));
        response.on('error', err => reject('Failed to push: ' + err));
        response.on('end', () => endHandler(tagName, pushResponses, resolve, reject));
    }

    image.push({ tag: tagName }, imageHandler);
    emitter.variant(tagName, 'Attempting to push to registry');
    return promise;
}

function onDataHandler(data, responses: any[], tagName: string) {
    var parsedData = JSON.parse(data);
    var output = data.toString().trim();
    log.debug('[PUSH] ' + output);
    emitter.variant(tagName, output);
    responses.push(parsedData);
}

function endHandler(tag, pushResponses: any[], resolve, reject) {
    var isErrors = pushResponses.some(res => !!res['errorDetail']);
    if (isErrors) {
        emitter.variant(tag, 'Failed to push to registry');
        return reject(pushResponses);
    }
    emitter.variant(tag, 'Successfully pushed to registry');
    log.info('Successfully pushed "' + tag + '" to registry');
    resolve(pushResponses);
}	