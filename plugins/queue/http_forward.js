var http = require('http');

exports.hook_queue = function(next, connection) {
    var config,
        receiverConfig,
        request;

    config = this.config.get('http_forward.ini');
    receiverConfig = config.receiver;
    receiverConfig.headers = {
        'Content-Type': 'application/octet-stream'
    };
    
    request = http.request(receiverConfig, function(response) {
        if(response.statusCode == 200) {
            next(OK, 'Message delivered to receiver');
        } else {
            next(DENY, 'Message rejected by receiver: ' + http.STATUS_CODES[response.statusCode]);
        }
    });
    
    request.on('error', function(error) {
        next(DENYSOFT, 'Queue failed due to HTTP error');
    });
    
    connection.loginfo(this, 'Forwarding message via HTTP');
    
    connection.transaction.message_stream.pipe(request);
    
    request.end();
}
