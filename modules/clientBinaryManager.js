const _ = global._;
const Q = require('bluebird');
const fs = require('fs');
const { app, dialog } = require('electron');
const got = require('got');
const path = require('path');
const Settings = require('./settings');
const Windows = require('./windows');
const ClientBinaryManager = require('ethereum-client-binaries').Manager;
const EventEmitter = require('events').EventEmitter;

const log = require('./utils/logger').create('ClientBinaryManager');

// should be       'https://raw.githubusercontent.com/ethereum/mist/master/clientBinaries.json'
const BINARY_URL =
  'https://walletapp.aichain.me/mist/master/clientBinaries.json';

const ALLOWED_DOWNLOAD_URLS_REGEX = /^https:\/\/(?:(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)?ethereum\.org\/|gethstore\.blob\.core\.windows\.net\/|bintray\.com\/artifact\/download\/karalabe\/ethereum\/)(?:.+)/; // eslint-disable-line max-len

class Manager extends EventEmitter {
  constructor() {
    super();

    this._availableClients = {};
  }

  init(restart) {
    return this._checkForNewConfig(restart);
  }

  getClient(clientId) {
    return this._availableClients[clientId.toLowerCase()];
  }

  _writeLocalConfig(json) {
    log.info('Write new client binaries local config to disk ...');

    fs.writeFileSync(
      path.join(Settings.userDataPath, 'clientBinaries.json'),
      JSON.stringify(json, null, 2)
    );
  }

  _checkForNewConfig(restart) {
    let binPath = path.join(process.cwd(), 'gait');
    
    log.info(`Detect gait path=: ${binPath}`);

    let platform = process.platform;

    // "win32" -> "win" (because nodes are bundled by electron-builder)
    if (platform.indexOf('win') === 0) {
      platform = 'win';
    } else if (platform.indexOf('darwin') === 0) {
      platform = 'mac';
    }
    if (platform === 'win') {
      binPath += '.exe';
    }
    
    this._availableClients.gait = {
      binPath,
      version: '1.0.2'
    };
  }

  _emit(status, msg) {
    log.debug(`Status: ${status} - ${msg}`);

    this.emit('status', status, msg);
  }
}

module.exports = new Manager();
