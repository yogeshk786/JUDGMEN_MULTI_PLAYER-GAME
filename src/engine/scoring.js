const calculateRoundScores =(playrs , bids , tricksWon) => {
    const rounResuls = {} ;


    players.forEach(player =>{
        const pId = player.id ;
        const bid = bids[pId] || 0 ;
        const won = tricksWon[pId] || 0 ;

        let pointEarned = 0;

        if(bid === won) {

            pointsEarned = 10 + bid ;

        }else {
            pointsEarned = 0 ;

        }

        rounResults[pId] ={
            bid ,
            won , 
            pointsErned ,
            newTotalScore : player.totalScore + pointsEarned 
        };

    }) ;

    return roundResults ;
};

module.export = { calculateRoundScores , updateMatchELO} ;
