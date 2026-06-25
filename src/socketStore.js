let io = null;

const onlineUsers = {};

const setIo = (socketIo) => {
    io = socketIo;
};

const getIo = () => io;

module.exports = {setIo, getIo, onlineUsers};