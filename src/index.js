module.exports = {
    Camera: require('./Camera').default,
    Player: require('./Player').default,
    utils: {
        toRadians: require('./utils').toRadians,
        toDegrees: require('./utils').toDegrees,
        deltaTime: require('./utils').deltaTime,
        lastUpdate: require('./utils').lastUpdate,
        updateTime: require('./utils').updateTime
    }
}

// import Camera from './Camera'

// export Camera;
