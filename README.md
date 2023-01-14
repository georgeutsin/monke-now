# monke-now

monke-now is a multi-step project for making poker bots using the fellas playing patterns

Roadmap:

1) Chrome plugin for scraping page data -- started with this repo: https://github.com/originalpete/pokernow-pot-odds-extension

2) monte carlo simulation for maximum monke -- assume everybody is playing all cards, and create a basic card-board probability signal. I stole the code from this repo: https://github.com/emileindik/poker-odds-machine 

--- this is as far as I got --

3) Add betting strategy - started this a bit with the pot odds calculation, but the goal here was to create a signal based on opponent bet sizes

4) Parse historical poker logs to start fitting each player to the hand + bet signals calculated above -- this can only be done when people show their cards/are forced to reveal

5) Run the regression using historical signals to give each person a "monke" score

I don't know ML so this was the best I could think of

