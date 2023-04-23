import { AppRuleProps, AppRuleType } from '../rules';
import { PurpleUrlApp } from '../lib/purple-url-app';
import { Env } from '../config';
import { unimplemented } from '../utils/utils';

console.log('Hello World');
export const addressSearchApiApp = new PurpleUrlApp('Address Search');

const oldApiPath = '/api/address-search-mfe/';
const apiPath = '/domain/customer/api/address-search-mfe/';
const mfePath = '/domain/customer/mfe/address-search-mfe/';

const hostUrls = [
  'https://orbit.iag.com.au',
  'https://orbit-pnv.iag.com.au',
  'https://orbit-uat.iag.com.au',
  'https://*.iagcloud',
].join(' ');

const cspHeaders = [
  `script-src 'self' https://cep.*.digital.iag.com.au`,
  `connect-src 'self' https://cep.*.digital.iag.com.au`,
  `img-src 'self' tags.iag.com.au *.chromadesignsystem.com fonts.googleapis.com fonts.gstatic.com s3.ap-southeast-2.amazonaws.com`,
  `frame-ancestors 'self' ${hostUrls}`,
  `style-src 'self' 'unsafe-inline' tags.iag.com.au *.chromadesignsystem.com fonts.googleapis.com fonts.gstatic.com s3.ap-southeast-2.amazonaws.com`,
  `font-src 'self' tags.iag.com.au *.chromadesignsystem.com fonts.googleapis.com fonts.gstatic.com s3.ap-southeast-2.amazonaws.com`,
  `base-uri 'self'`,
  `form-action 'self'`,
].join(';');

addressSearchApiApp.setAppRuleType(AppRuleType.API);

addressSearchApiApp.addRule((env) => {
  const stripOldApiPath: AppRuleProps = {
    name: 'Strip /api/address-search-mfe/',
    criteria: {
      paths: [`${oldApiPath}*`],
    },
    behaviors: {
      stripPaths: [oldApiPath],
    },
  };

  const stripNewApiPath: AppRuleProps = {
    name: 'Strip /domain/customer/api/address-search-mfe/',
    criteria: {
      paths: [`${apiPath}*`],
    },
    behaviors: {
      stripPaths: [apiPath],
    },
  };

  return {
    type: AppRuleType.API,
    name: env.subEnvId ? env.subEnvId : 'default',
    criteria: {
      paths: [`${oldApiPath}*`, `${apiPath}*`],
      hostnames: env.subEnvId ? [`*${env.subEnvId}.*`] : undefined,
    },
    behaviors: {
      origin: { hostname: env.origin },
      originBasePath: '/prod/',
      allowMethods: {
        PUT: true,
        POST: true,
      },
    },
    children: [stripOldApiPath, stripNewApiPath],
  };
});

addressSearchApiApp.addRule(() => ({
  name: 'CSP Headers',
  behaviors: {
    modifyOutgoingResponseHeaders: [
      {
        action: 'ADD',
        standardAddHeaderName: 'OTHER',
        customHeaderName: 'Content-Security-Policy',
        headerValue: cspHeaders,
      },
    ],
  },
}));

addressSearchApiApp.addRule((env) => ({
  name: env.subEnvId ?? 'default',
  type: AppRuleType.SITE,
  criteria: {
    paths: [mfePath + '*'],
  },
  behaviors: {
    stripPaths: [mfePath],
    originBasePath: '/address-search-mfe/',
    spa: true,
  },
}));

addressSearchApiApp.addEnvProps(Env.Dev, {
  origin: 'xjshaemgji.execute-api.ap-southeast-2.amazonaws.com',
});

addressSearchApiApp.addEnvProps(Env.Tst, unimplemented);

addressSearchApiApp.addEnvProps(Env.Stub, {
  origin: 'xcebrdm0bk.execute-api.ap-southeast-2.amazonaws.com',
});

addressSearchApiApp.addEnvProps(Env.Sit, {
  origin: 'rjptkb1cb3.execute-api.ap-southeast-2.amazonaws.com',
});

addressSearchApiApp.addEnvProps(Env.Perf, {
  origin: 'igdhba4e22.execute-api.ap-southeast-2.amazonaws.com',
});

addressSearchApiApp.addEnvProps(Env.Stg, {
  subEnvProps: {
    bata: {
      origin: 'r6p32sw4mk.execute-api.ap-southeast-2.amazonaws.com',
    },
    psup1: {
      origin: '44cdvk59ci.execute-api.ap-southeast-2.amazonaws.com',
    },
    psup2: {
      origin: '36qh8wdtn1.execute-api.ap-southeast-2.amazonaws.com',
    },
    trn: {
      origin: 'qu071gkrg8.execute-api.ap-southeast-2.amazonaws.com',
    },
  },
});

addressSearchApiApp.addEnvProps(Env.Prd, {
  origin: 'iq2k8jti06.execute-api.ap-southeast-2.amazonaws.com',
});
