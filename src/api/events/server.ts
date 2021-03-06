import * as socketIo from 'socket.io';
import web from '../web/server';

export var server: SocketIO.Server;

export function start() {
    server = socketIo(web.listener);   
    return Promise.resolve(true);
}