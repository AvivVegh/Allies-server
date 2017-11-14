exports.createJsonRespone = function(message, status) {
    return {data: message, resultCode: status}
}