// axios intercepters
import { axiosPrivate } from '../api/axios';

import { useEffect } from 'react';
import { useRefreshToken } from './useRefreshToken';
import { useAuth } from './useAuth';

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { accessToken, setAccessToken } = useAuth();

    useEffect(() => {

        // adds accessToken in headers before every request
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                  config.headers['Authorization'] = `Bearer ${accessToken}`;
                }
                return config;
            }, 
            
            (error) => {
                Promise.reject(error);
            }
        )

        // uses refresh endpoint if access token is expired;                                                                                                                                                                                                    
        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 401 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    const newAccessToken = await refresh();
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    setAccessToken(newAccessToken);
                    return axiosPrivate(prevRequest);
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.response.eject(responseIntercept);
            axiosPrivate.interceptors.request.eject(requestIntercept);
        }

    }, [accessToken, refresh])

    return axiosPrivate;
}


export { useAxiosPrivate };