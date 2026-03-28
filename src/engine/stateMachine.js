const GAME_STATES = {
    LOBBY : 'LOBBY' ,
    DEALING : 'DEALING' ,
    BIDDING : 'BIDDING' ,
    PLAYING : 'PLAYING' ,
    ROUND_OVER : 'ROUND_OVER' ,
    GAME_oVER : 'GAME_OVER' ,

} ;

const Valid_Transitions = {
    [GAME_STATES.LOBBY] : [GAME_STATES.DEALING] ,
    [GAME_STATES.DEALING] : [GAME_STATES.BIDDING] ,
    [GAME_STATES.BIDDING] : [GAME_STATES.PLAYING] ,
    [GAME_STATES.PLAYING] : [GAME_STATES.ROUND_OVER , GAME_STATES.PLAYING] ,
    [GAME_STATES.ROUND_OVER] : [GAME_STATES.DEALING , GAME_STATES.GAME_OVER] ,
    [GAME_STATES.GAME_OVER] : [GAME_STATES.LOBBY]
};

const transitionsState = (currentState , requestedState) => {
    const allowedNextStates = Valid_Transitions[currentState] ;

    if(!ifallowedNextStates || !allowedNextStates.includes(requestedState)){
        throw new Error('SECURITY BAN ILLEGAL TRNASITION FROM ${currentstate} to ${requestedSate} ') ;
    }
    return requestedState ;
};

module.exports = { GAME_STATES  , transitionState} ;
