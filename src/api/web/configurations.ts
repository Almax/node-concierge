import * as get from '../configurations/get';
import saveAll from '../configurations/saveAll';
import server from './server';
import * as Boom from 'boom';

var getRoute = {
	path: '/configurations',
	method: 'GET',
	handler: (request, reply) => {
		get.get()
			.then(config => reply([config]))
			.catch(error => reply(Boom.expectationFailed('Failed to retrieve configurations: ' + error)));
	}
}

var postRoute = {
	path: '/configurations',
	method: 'POST',
	handler: (request, reply) => {
		saveAll(request.payload)
			.then(reply) 
			.catch(error => reply(Boom.expectationFailed('Failed to update configurations: ' + error)));
	}
}

server.route(getRoute);
server.route(postRoute);