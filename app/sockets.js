var sockets = module.exports = {};

var _ = require('lodash');
var batchService = require('./batch/batchService');

sockets.userCount = 0;

sockets.setup = function(io){
    sockets.io = io;
    sockets.main();
};

sockets.updateStatus = function(socket){
    if (socket != null){
        socket.emit('status', {usersOnline: sockets.userCount});
    } else {
        sockets.io.emit('status', {usersOnline: sockets.userCount});
    }
};

sockets.updateBatchInfo =  _.throttle(function(socket){
    if (socket != null){
        socket.emit('batchInfo', batchService.processes[0]);
    } else {
        sockets.io.emit('batchInfo', batchService.processes[0]);
    }
}, 1000);

sockets.main = function() {
    sockets.io.on('connection', function(socket){
        ++sockets.userCount;

        sockets.updateStatus();

        socket.on('requestBatchInfo', function(){
            sockets.updateBatchInfo(socket);
        });

        socket.on('requestStatus', function(){
            sockets.updateStatus(socket);
        });

        socket.on('disconnect', function () {
            --sockets.userCount;
            sockets.updateStatus();
        });
    });
};