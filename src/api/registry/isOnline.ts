import getRegistry from './getRegistry';
import * as request from '../request';

/**
 * Will resolve if the registry is contactable, else reject
 * Satisfies /v1 and /v2 versions of registry API
 */
export default async(() => {
    try {
        let registry = await(getRegistry());
        return !!registry;
    } catch (ex) {
        return false;
    }
    
});