function channelMock() {}
channelMock.prototype.onmessage = function () {};
channelMock.prototype.postMessage = function (data) {
	this.onmessage({ data });
};
channelMock.prototype.addEventListener = function () {};
global.BroadcastChannel = channelMock;
