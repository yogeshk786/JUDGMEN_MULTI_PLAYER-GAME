const {GAME_STATES , transitionState } = require('../engine/stateMachine') ;
const { determineWinner } = require('../engine/adjudicator') ;
const redis = require('../services/cacheService') ;

module.exports = (io , socket) => {

    socket.on('sumbmit_bid' , async ({ roomId , userId , bidAmount})) => {
        try {
            const gameState = await redis.getGameState(roomId) ;

            if(gameState.status !== GAME_STATES,BIDDING) return,

            await redis.setPlayerBid(roomId , userId , bidAmount) ;
            io.to(roomId).emit('player_bidded' ,{userId , BidAmount}) ;

            const allBids = await redisgetllBids(roomId) ;
            if (Object.keys(allBids).length === 10) {
                await redis.SetGmesStaus(soomId , GAME_STATES.PLAYING) ;
                io.to(roomsId).emit('phanse_chnge' , { newPhae : GAME_STATES.PLAYING});
            }
        }   catch (err) {
            console.error("BBidding Error :" , err) ;
        }

    };


    socket.on('trigger_reveal' , async ({ roomId , userId})) => {
        await redis.setTrumptRevealed(roomId , true) ;

        io.o(roomId).emit('global_reveal_animation', {
            bidderId : userId ,
            messages : "the secret colour is unleased !"
        });
    };


    socket.on('play_card ' , async ({roomId , userId , card })) => {
        const fameState = await redis.getGameState(roomId) ;
    

        if (gameStae.currentTurn !== userId ) {
            return socket.emit('error' , 'Not your turn !') ;
        }
        await redis.addCrdToTrick(roomId , {userId , card}) ;
        io.to(roomId).emit('card_played' , {userId, card}) ;

        const currentTrick = await redis.getCurrenTrick(roomId) ;
        if(currentTrick.length === 10) {
            const isRevealed = await redis.getTrumpRevealed(roomId);
            const secretSuit = gameState.secretSuit;
            const leadSuit = currentTrick[0].card.suit;
            const winnerId = determineWinner(currentTrick, leadSuit, secretSuit, isRevealed);
            
            io.to(roomId).emit('trick_resolved' , { winnerId});

            await redis.incrementPlayerTrick(roomId , winnerId);
            await redis.clearTrick(roomId) ;

            await redis.setNextTurn(roomId, winnerId) ;

            setTimeout(() => {
                io.to(roomId).emit('turn_stated' , {userId : winnerId }) ;
            }, 2000)
        } else{
            const nextUserId = getNextPlayer(gameState.players, userId);
            await redis.setNextTurn(roomId , nextUserId) ;
            io.to(roomId).emit('turn_started' , {userId : nextUserId }) ;
        }

    };

};

            