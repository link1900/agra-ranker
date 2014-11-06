var sockets = module.exports = {};

var _ = require('lodash');
var batchService = require('./batch/batchService');

sockets.setup = function(io){
    sockets.io = io;
    sockets.main();
};

sockets.updateBatchInfo = _.throttle(function(){
    sockets.io.emit('batchInfo', batchService.getBatchInfo());
}, 5000);



sockets.main = function() {
    sockets.io.on('connection', function(socket){
        socket.on('requestBatchInfo', function(){
            socket.emit('batchInfo', batchService.getBatchInfo());
        });
    });
};