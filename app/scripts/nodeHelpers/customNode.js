'use strict';
var customNode = function(srvrUrl, port) {
    this.SERVERURL = port ? srvrUrl + ':' + port : srvrUrl;
}
customNode.prototype.config = {
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    }
};

customNode.prototype.getCurrentBlock = function(callback) {
    this.post({
        method: 'eth_blockNumber'
    }, function(data) {
        if (data.error) callback({ error: true, msg: data.error.message, data: '' });
        else callback({ error: false, msg: '', data: new BigNumber(data.result).toString() });
    });
}
customNode.prototype.getChainId = function(callback) {
    this.post({
        method: 'net_version'
    }, function(data) {
        if (data.error) callback({ error: true, msg: data.error.message, data: '' });
        else callback({ error: false, msg: '', data: parseInt(data.result) });
    });
}
customNode.prototype.getBalance = function(addr, callback) {
    this.post({
        method: 'eth_getBalance',
        params: [addr, 'latest']
    }, function(data) {
        if (data.error) callback({ error: true, msg: data.error.message, data: '' });
        else callback({ error: false, msg: '', data: { address: addr, balance: new BigNumber(data.result).toString() } });
    });
}
customNode.prototype.getTransactionData = function(addr, callback) {
    var response = { error: false, msg: '', data: { address: addr, balance: '', gasprice: '', nonce: '' } };
    var parentObj = this;
    parentObj.getBalance(addr, function(data) {
        if (data.error) {
            callback({ error: true, msg: data.msg, data: '' });
            return;
        }
        response.data.balance = data.data.balance;
        parentObj.post({
            method: 'eth_gasPrice'
        }, function(data) {
            if (data.error) {
                callback({ error: true, msg: data.error.message, data: '' });
                return;
            }
            response.data.gasprice = data.result;
            parentObj.post({
                method: 'eth_getTransactionCount',
                params: [addr, 'latest']
            }, function(data) {
                if (data.error) {
                    callback({ error: true, msg: data.error.message, data: '' });
                    return;
                }
                response.data.nonce = data.result;
                callback(response);
            });
        });
    });
}
customNode.prototype.sendRawTx = function(rawTx, callback) {
    this.post({
        method: 'eth_sendRawTransaction',
        params: [rawTx]
    }, function(data) {
        if (data.error) callback({ error: true, msg: data.error.message, data: '' });
        else callback({ error: false, msg: '', data: data.result });
    });
}
customNode.prototype.getEstimatedGas = function(txobj, callback) {
    this.post({
        method: 'eth_estimateGas',
        params: [{ to: txobj.to, value: txobj.value, data: txobj.data }]
    }, function(data) {
        if (data.error) callback({ error: true, msg: data.error.message, data: '' });
        else callback({ error: false, msg: '', data: data.result });
    });
}
customNode.prototype.getEthCall = function(txobj, callback) {
    this.post({
        method: 'eth_call',
        params: [{ to: txobj.to, data: txobj.data }]
    }, function(data) {
        if (data.error) callback({ error: true, msg: data.error.message, data: '' });
        else callback({ error: false, msg: '', data: data.result });
    });
}
customNode.prototype.getTraceCall = function(txobj, callback) {
    this.post({
        method: 'trace_call',
        params: [txobj, ["stateDiff", "trace", "vmTrace"]]
    }, function(data) {
        if (data.error) callback({ error: true, msg: data.error.message, data: '' });
        else callback({ error: false, msg: '', data: data.result });
    });
}
customNode.prototype.post = function(data, callback) {
    data.id = Math.floor((Math.random() * 99999999) + 1);
    data.jsonrpc = "2.0";
    ajaxReq.http.post(this.SERVERURL, JSON.stringify(data), this.config).then(function(data) {
        callback(data.data);
    }, function(data){
        callback({ error: true, msg: "connection error", data: "" });
    });
}
module.exports = customNode;
