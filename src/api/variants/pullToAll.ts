import * as getHosts from '../hosts/get';
import getDockerClient from '../dockerClient';
import pullVariant from '../hosts/pullVariant';

/**
 * Deprecated
 * Pull an image to all hosts
 */
export default function pullToAll(variantName: string) {
	var requests = getHosts.all()
		.then((hosts: Concierge.Host[]) => {
			return Promise.all(hosts.map(host => pullVariant(host, variantName)));
		});
	
	return requests;
}