const fs = require('fs');

const treeText = `
├── 1/
│   ├── index.html
│   └── meta/og_image.png
├── 10-minutes-till-dawn/
│   ├── index.html
│   └── splash.png
├── 100ng/
│   ├── index.html
│   └── 100ng.jpg
├── 1v1-lol/
│   └── index.html
├── 1v1space/
│   ├── index.html
│   └── splash.png
├── 2048/
│   ├── index.html
│   └── thumb.png
├── 2048-multitask/
│   ├── index.html
│   └── splash.png
├── 9007199254740992/
│   ├── index.html
│   └── logo-4.png
├── 99balls/
│   ├── index.html
│   └── 99-balls-evo.jpg
├── a-dance-of-fire-and-ice/
│   ├── index.html
│   └── splash.png
├── achievementunlocked/
│   ├── index.html
│   └── achievementunlocked.png
├── adarkroom/
│   ├── index.html
│   └── splash.png
├── adrenalinechallenge/
│   ├── index.html
│   └── adrenalinechallenge.jpg
├── adventure-drivers/
│   ├── index.html
│   └── splash.png
├── ages-of-conflict/
│   ├── index.html
│   └── splash.jpg
├── alienhominid/
│   ├── index.html
│   └── alienhominid.jpg
├── amazing-rope-police/
│   ├── index.html
│   └── splash.jpeg
├── amidst-the-clouds/
│   ├── index.html
│   └── splash.png
├── among-us/
│   ├── index.html
│   └── penumbra.png
├── angry-sharks/
│   ├── index.html
│   └── assets/img/splash.png
├── aquapark-slides/
│   ├── index.html
│   └── splash.png
├── astray/
│   ├── index.html
│   └── splash.png
├── avalanche/
│   ├── index.html
│   └── avalanche.png
├── awesometanks2/
│   ├── index.html
│   └── awesometanks2.jpg
├── backrooms/
│   ├── index.html
│   └── img/splash.jpg
├── backrooms-2d/
│   ├── index.html
│   └── splash.png
├── backrooms2d/
│   ├── backrooms2d.html
│   └── splash.jpeg
├── bacon-may-die/
│   ├── index.html
│   └── splash.png
├── bad-ice-cream/
│   ├── index.html
│   └── bad-ice-cream.png
├── bad-ice-cream-2/
│   ├── index.html
│   └── bad-ice-cream-2.png
├── bad-ice-cream-3/
│   ├── index.html
│   └── bad-ice-cream-3.png
├── baldis-basics/
│   ├── index.html
│   └── splash.png
├── balldodge/
│   ├── balldodge.html
│   └── splash.jpeg
├── ballistic-chickens/
│   ├── index.html
│   └── logo.png
├── basket-random/
│   ├── index.html
│   └── splash.jpeg
├── basketball-stars/
│   ├── index.html
│   └── basketball-stars.jpg
├── basketbros-io/
│   ├── index.html
│   └── thumb.jpg
├── battleforgondor/
│   ├── index.html
│   └── battleforgondor.JPG
├── bigredbutton/
│   ├── index.html
│   └── bigredbutton.png
├── bitlife/
│   ├── index.html
│   └── splash.png
├── blacholesquare/
│   ├── index.html
│   └── icon.png
├── blackknight/
│   ├── index.html
│   └── blackknight.png
├── blockpost/
│   ├── index.html
│   └── thumb.png
├── bloonstd/
│   ├── index.html
│   └── bloonstd.jpg
├── bloonstd2/
│   ├── index.html
│   └── bloonstd2.png
├── bloxors/
│   ├── index.html
│   └── title.png
├── bntts/
│   ├── index.html
│   └── icons/icon-256.png
├── bobtherobber2/
│   ├── index.html
│   └── splash.jpeg
├── bonkio/
│   ├── bonkio.html
│   └── image.png
├── boxhead2play/
│   ├── index.html
│   └── boxhead2play.jpg
├── boxing-random/
│   ├── index.html
│   └── 512x512.jpg
├── breakingthebank/
│   ├── index.html
│   └── breakingthebank.png
├── btd4/
│   ├── index.html
│   └── splash.png
├── btd5/
│   ├── index.html
│   └── BT5_Deluxe_logo.png
├── btts/
│   ├── index.html
│   └── splash.png
├── burger-and-frights/
│   ├── index.html
│   └── splash.png
├── bus and subway/
│   ├── index.html
│   └── img.jpg
├── busandsubway/
│   ├── index.html
│   └── img.jpg
├── cannon-basketball-4/
│   ├── index.html
│   └── img/splash.png
├── canyondefense/
│   ├── index.html
│   └── canyondefense.png
├── cars-simulator/
│   ├── index.html
│   └── splash.png
├── cell-machine/
│   ├── index.html
│   └── img/icon.png
├── champion-island/
│   ├── index.html
│   └── splash.png
├── championarcher/
│   ├── index.html
│   └── championarcher.png
├── checkers/
│   ├── checkers.html
│   └── image.png
├── chess/
│   ├── chess.html
│   └── splash.jpeg
├── chill-radio/
│   ├── index.html
│   └── img/chill-logo.png
├── chrome-dino/
│   ├── index.html
│   └── icons/icon-256.png
├── circlo/
│   ├── index.html
│   └── img/icon.png
├── classicube/
│   ├── index36fc.html
│   └── classicube.jpeg
├── cluster-rush/
│   ├── index.html
│   └── splash.png
├── CMM-Client/
│   ├── CMM Client.html
│   └── EC4B216C-B637-41A3-A3D9-79D4048DD7A3.jpeg
├── cnpingpong/
│   ├── index.html
│   └── tabletennisultimate.png
├── connect3/
│   ├── index.html
│   └── connect3.png
├── cookie-clickers/
│   ├── cookie-clicker/
│   │   ├── index.html
│   │   └── img/perfectCookie.png
├── core-ball/
│   ├── index.html
│   └── image/WB_logo.png
├── craftmine/
│   ├── index.html
│   └── images/craftmine.png
├── creativekillchamber/
│   ├── index.html
│   └── creativekillchamber.jpg
├── crossyroad/
│   ├── index.html
│   └── crossyroad.png
├── csgo-clicker/
│   ├── index.html
│   └── images/case1.png
├── ctr/
│   ├── index.html
│   └── logo.png
├── ctr-holiday/
│   ├── index.html
│   └── Holiday_Gift.webp
├── ctr-tr/
│   ├── index.html
│   └── logo.png
├── cubefield/
│   ├── index.html
│   └── assets/splash.png
├── cupcake2048/
│   ├── index.html
│   └── style/img/bg.jpg
├── dante/
│   ├── index.html
│   └── splash.png
├── deal-or-no-deal/
│   ├── index.html
│   └── index.jpg
├── death-run-3d/
│   ├── index.html
│   └── img/death.png
├── deepest-sword/
│   ├── index.html
│   └── splash.jpg
├── defend-the-tank/
│   ├── index.html
│   └── images/splash.jpg
├── doctor-acorn2/
│   ├── index.html
│   └── splash.jpg
├── dodge/
│   ├── dodge.html
│   └── splash.jpeg
├── doge2048/
│   ├── index.html
│   └── doge1.jpeg
├── DogeMiner/
│   ├── index.html
│   └── img/dogeminer_300x300.png
├── Dogeminer2/
│   ├── index.html
│   └── thumb.jpg
├── doodle-jump/
│   ├── index.html
│   └── doodle.png
├── doom/
│   ├── doom.html
│   └── splash.jpeg
├── DOOMORI/
│   ├── index.html
│   └── splash.png
├── doublewires/
│   ├── index.html
│   └── doublewires.png
├── dragon-vs-bricks/
│   ├── index.html
│   └── splash.png
├── draw-the-hill/
│   ├── index.html
│   └── icons/icon-512.png
├── drift-boss/
│   ├── index.html
│   └── splash.png
├── drift-hunters/
│   ├── index.html
│   └── drift-hunters.png
├── drive-mad/
│   ├── index.html
│   └── logo.jpg
├── ducklife1/
│   ├── index.html
│   └── ducklife.png
├── ducklife2/
│   ├── index.html
│   └── ducklife2.png
├── ducklife3/
│   ├── index.html
│   └── title.png
├── ducklife4/
│   ├── index.html
│   └── splash.jpg
├── duke-nukem-2/
│   ├── index.html
│   └── splash.jpg
├── dumbwaystodie/
│   ├── dumbwaystodie.html
│   └── image.png
├── eaglerfaithful/
│   ├── index.html
│   └── img/old.png
├── earntodie/
│   ├── index.html
│   └── loading.png
├── edge-surf/
│   ├── index.html
│   └── splash.png
├── edgenotfound/
│   ├── index.html
│   └── edge.png
├── eel-slap/
│   ├── index.html
│   └── eel-slap.png
├── eggycar/
│   ├── index.html
│   └── eggy-car.png
├── elasticman/
│   ├── index.html
│   └── elasticman.jpg
├── endlesswar3/
│   ├── index.html
│   └── endlesswar3.png
├── escapingtheprison/
│   ├── index.html
│   └── escapingtheprison.jpg
├── evil-glitch/
│   ├── index.html
│   └── icon.jpeg
├── evolution/
│   ├── index.html
│   └── splash.png
├── exo/
│   ├── index.html
│   └── img/small.jpg
├── factoryballs/
│   ├── index.html
│   └── images/splash.png
├── fairsquares/
│   ├── index.html
│   └── index.icon.png
├── fake-virus/
│   ├── index.html
│   └── fake-virus.png
├── fancypantsadventures/
│   ├── index.html
│   └── fancypantsadventure.png
├── fantasy-dash/
│   ├── fantasydash.html
│   └── splash.jpeg
├── fireboywatergirlforesttemple/
│   ├── index.html
│   └── logo.jpeg
├── flappy plane/
│   ├── Flappy Plane.html
│   └── E3A4179E-B8E4-4358-BDAD-45AA7637D4D7.jpeg
├── flappy-2048/
│   └── index.html
├── flappy-bird/
│   ├── index.html
│   └── assets/splash.png
├── flappybird/
│   ├── index.html
│   └── logo.png
├── flappyplane/
│   ├── flappyplane.html
│   └── splash.jpeg
├── flashtetris/
│   ├── index.html
│   └── flashtetris.png
├── fleeingthecomplex/
│   ├── index.html
│   └── a.png
├── flippy-fish/
│   ├── index.html
│   └── cwzPGJ.png
├── fnaw/
│   ├── index.html
│   └── splash.png
├── fridaynightfunkin/
│   ├── index.html
│   └── fnf-icon.jpg
├── froggys-battle/
│   ├── index.html
│   └── splash.png
├── fruitninja/
│   ├── index.html
│   └── FruitNinjaTeaser.jpg
├── frying-nemo/
│   ├── index.html
│   └── splash.png
├── gachalife/
│   ├── index.html
│   └── splash.png
├── game-inside/
│   ├── index.html
│   └── img/display.png
├── gearsofbabies/
│   └── index.html
├── generic-fishing-game/
│   ├── index.html
│   └── splash.png
├── geochallenge/
│   └── index.html
├── geodash/
│   ├── index.html
│   └── geoscratchicon.png
├── geodashlite/
│   ├── geodashlite.html
│   └── geodashlite.png
├── geogeo/
│   └── index.html
├── geops1/
│   └── index.html
├── georash/
│   └── index.html
├── georgeandtheprinter/
│   ├── index.html
│   └── img/icon.png
├── geotrash/
│   └── index.html
├── getaway-shootout/
│   ├── index.html
│   └── img/index.jpg
├── gimme-the-airpod/
│   ├── index.html
│   └── img/logo.png
├── gladihoppers/
│   ├── index.html
│   └── gladihop.png
├── glass-city/
│   ├── index.html
│   └── image.png
├── gmonster/
│   └── index.html
├── go-ball/
│   ├── index.html
│   └── game.jpg
├── goodnight/
│   ├── index.html
│   └── goodnight.jpg
├── goodnight-meowmie/
│   ├── index.html
│   └── splash.png
├── google-feud/
│   ├── index.html
│   └── splash.png
├── google-snake/
│   ├── index.html
│   └── img/snake.png
├── gravity-soccer/
│   ├── index.html
│   └── splash.png
├── greybox/
│   ├── index.html
│   └── ico.png
├── grindcraft/
│   ├── index.html
│   └── img/splash.png
├── hackertype/
│   ├── index.html
│   └── logo192.png
├── handshakes/
│   ├── index.html
│   └── splash.jpg
├── happy-hop/
│   ├── index.html
│   └── splash.png
├── happywheels/
│   ├── index.html
│   └── b.png
├── hardware-tycoon/
│   ├── index.html
│   └── loading-logo.png
├── hba/
│   ├── index.html
│   └── hoverbotarena.JPG
├── helicopter/
│   ├── index.html
│   └── helicopter.png
├── hellscaper/
│   └── WebGL/
│       └── index.html
├── hexempire/
│   ├── index.html
│   └── hexempire.jpg
├── HexGL/
│   ├── index.html
│   └── icon.png
├── hextris/
│   ├── index.html
│   └── images/hextris-logo.png
├── highrisehop/
│   ├── index.html
│   └── assets/gfx/logo.png
├── hill-climb-racing/
│   ├── index.html
│   └── splash.jpeg
├── hungry-lamu/
│   ├── index.html
│   └── splash.png
├── iceagebaby/
│   ├── index.html
│   └── thumb.png
├── iceagebaby2/
│   ├── index.html
│   └── pinky.jpg
├── idle-breakout/
│   ├── index.html
│   └── thumbnail.png
├── idle-shark/
│   ├── index.html
│   └── sharklogo.png
├── idledice/
│   └── Idle Dice.html
├── impossiblequiz/
│   ├── index.html
│   └── impossiblequiz.png
├── impossiblequiz2/
│   ├── index.html
│   └── impossible_quiz2.png
├── impossiblequizbeta/
│   └── index.html
├── interactivebuddy/
│   ├── index.html
│   └── interactivebuddy.jpg
├── invite-the-blackbird/
│   ├── index.html
│   └── splash.png
├── iron dash/
│   ├── Iron Dash.html
│   └── 9FF39FCC-64B1-491C-97FC-A34357F9583A.jpeg
├── irondash/
│   ├── irondash.html
│   └── splash.jpeg
├── jetpack-joyride/
│   ├── index.html
│   └── splash.jpg
├── jmw-v6/
│   ├── index.html
│   └── jmw.png
├── just-fall/
│   ├── index.html
│   └── splash.jpg
├── just-one-boss/
│   ├── index.html
│   └── pv1Gr5.png
├── kirkaio/
│   ├── kirka.html
│   └── splash.jpeg
├── kitchen-gun-game/
│   ├── index.html
│   └── splash.png
├── kittencannon/
│   ├── index.html
│   └── kittencannon.png
├── knife-master/
│   ├── index.html
│   └── 512x512.jpg
├── krunker/
│   ├── index.html
│   └── img/krunker-io.jpg
├── learntofly/
│   ├── index.html
│   └── learntofly.png
├── learntofly2/
│   ├── index.html
│   └── learn-to-fly-2.jpg
├── level13/
│   ├── index.html
│   └── thumb.png
├── linerider/
│   ├── linerider.html
│   └── splash.jpeg
├── linkgen/
│   ├── index.html
│   └── gen.png
├── ltf-idle/
│   ├── index.html
│   └── thumbnail.jpg
├── ltf3/
│   ├── index.html
│   └── logo.png
├── madalin-stunt-cars-2/
│   ├── index.html
│   └── img/logo.jpg
├── madalin-stunt-cars-3/
│   ├── index.html
│   └── img/index.jpg
├── mario/
│   ├── index.html
│   └── Theme/Mario.gif
├── marvinspectrum/
│   ├── index.html
│   └── marvinspectrum.png
├── matrixrampage/
│   ├── index.html
│   └── matrixrampage.jpg
├── mcje/
│   ├── Mine.html
│   └── splash.jpeg
├── meme2048/
│   ├── index.html
│   └── img/advice_dog_background.jpg
├── merge-round-racers/
│   ├── index.html
│   └── splash.png
├── mindustry/
│   ├── index.html
│   └── splash.png
├── mineblocks/
│   ├── index.html
│   └── splash.png
├── minecraft-15/
│   ├── index.html
│   └── splash.jpeg
├── minecraft-18/
│   ├── index.html
│   └── splash.png
├── minecraft-classic/
│   ├── index.html
│   └── pack.png
├── minecraftbeta/
│   ├── index.html
│   └── bg_main.png
├── minecrafttowerdefence/
│   └── mctowerdefence.html
├── minesweeper/
│   ├── index.html
│   └── img/minesweeper.png
├── miniputt/
│   ├── index.html
│   └── miniputt.png
├── missiles/
│   ├── index.html
│   └── miss.png
├── MonkeyMart/
│   └── index.html
├── monster-tracks/
│   ├── index.html
│   └── thumb.jpg
├── motox3m/
│   ├── index.html
│   └── splash.jpg
├── motox3m-pool/
│   ├── index.html
│   └── splash.jpg
├── motox3m-spooky/
│   ├── index.html
│   └── splash.jpeg
├── motox3m-winter/
│   ├── index.html
│   └── download.jpeg
├── motox3m2/
│   └── index.html
├── my-rusty-submarine/
│   ├── index.html
│   └── splash.png
├── n-gon/
│   ├── index.html
│   └── bot.png
├── ninja/
│   ├── index.html
│   └── logo1.png
├── ninjavsevilcorp/
│   ├── index.html
│   └── splash.png
├── noob-steve-parkour/
│   ├── index.html
│   └── logo.png
├── ns-shaft/
│   ├── index.html
│   └── icon.png
├── nsresurgence/
│   ├── index.html
│   └── neon.png
├── OfflineParadise/
│   ├── index.html
│   └── assets/icon.jpeg
├── om-bounce/
│   ├── index.html
│   └── assets/icon.png
├── osu!/
│   ├── index.html
│   └── osu.png
├── out-of-ctrl/
│   └── OutOfCtrl_v1_2/
│       └── index.html
├── overwatch/
│   ├── overwatch.html
│   └── splash.jpeg
├── ovo/
│   ├── index.html
│   └── ovo.png
├── pandemic2/
│   ├── index.html
│   └── pandemic2.png
├── papasburgeria/
│   ├── index.html
│   └── splash.jpg
├── papaspizzaria/
│   ├── index.html
│   └── papaspizzaria.jpg
├── paperio2/
│   ├── index.html
│   └── images/logo.png
├── papery-planes/
│   ├── index.html
│   └── splash.jpg
├── particle-clicker/
│   ├── index.html
│   └── assets/pc32.png
├── piclient/
│   ├── piclient.html
│   └── splash.jpeg
├── pigeon-ascent/
│   ├── index.html
│   └── index.png
├── pixel-gun-survival/
│   ├── index.html
│   └── 512x512.png
├── planetlife/
│   ├── index.html
│   └── images/super-planetlife.gif
├── plantsvzombie1/
│   └── pvz1.html
├── polybranch/
│   ├── index.html
│   └── img/pic1.png
├── popcat-classic/
│   ├── index.html
│   └── splash.png
├── portalflash/
│   ├── index.html
│   └── portaltheflashversion.jpg
├── precision-client/
│   ├── index.html
│   └── logo.png
├── protektor/
│   ├── index.html
│   └── splash.jpg
├── push-the-square/
│   ├── index.html
│   └── img/splash.png
├── push-your-luck/
│   ├── index.html
│   └── assets/img/push.png
├── rabbit-samurai/
│   ├── index.html
│   └── splash.png
├── rabbit-samurai2/
│   ├── index.html
│   └── splash.png
├── resent-client/
│   ├── 1.8/
│   │   └── index.html
│   ├── index.html
│   └── splash.jpg
├── retro-bowl/
│   ├── index.html
│   └── img/splash.png
├── rhythm-doctor/
│   └── index.html
├── riddleschool/
│   ├── index.html
│   └── riddleschool.png
├── riddleschool2/
│   ├── index.html
│   └── riddleschool2.png
├── riddleschool3/
│   ├── index.html
│   └── riddleschool3.png
├── riddleschool4/
│   ├── index.html
│   └── riddleschool4.png
├── riddleschool5/
│   ├── index.html
│   └── riddleschool5.png
├── riddletransfer/
│   ├── index.html
│   └── riddletransfer.png
├── riddletransfer2/
│   ├── index.html
│   └── riddletransfer2.png
├── roblox/
│   └── index.html
├── roblox copy/
│   ├── index.html
│   └── splash.png
├── robuxclicker/
│   ├── robuxclicker.html
│   └── splash.jpeg
├── Rocket-League/
│   ├── index.html
│   └── splash.png
├── rolling-forests/
│   ├── index.html
│   └── icon.png
├── rolly-vortex/
│   ├── index.html
│   └── icon-256.png
├── rooftop-snipers/
│   ├── index.html
│   └── img/thumb.png
├── roommate/
│   └── 31/
│       └── index.html
├── ruffle/
│   ├── index.html
│   └── splash.png
├── run/
│   ├── index.html
│   └── run.png
├── Run 2/
│   ├── index.html
│   └── run-2-logo.jpg
├── run 3/
│   ├── Run 3.html
│   └── image_proxy.jpg
├── run2/
│   ├── index.html
│   └── run-2-logo.jpg
├── run3/
│   ├── index.html
│   └── splash.png
├── run4bootleg/
│   └── index.html
├── runner/
│   ├── index.html
│   └── loading3860.png
├── sand-game/
│   ├── index.html
│   └── sand.png
├── sandboxels/
│   ├── index.html
│   └── sandboxels.jpg
├── santy-is-home/
│   ├── index.html
│   └── splash.png
├── scooperia/
│   ├── index.html
│   └── scoop.png
├── scrapmetal/
│   ├── index.html
│   └── img/splash.png
├── scratcharia/
│   ├── index.html
│   └── splash.png
├── ShapeShootout/
│   ├── index.html
│   └── Icon.png
├── shellshockers/
│   ├── index.html
│   └── img/favicon.jpg
├── shogunshowdown/
│   ├── shogunshowdown.html
│   └── splash.png
├── shotinthedark/
│   ├── index.html
│   └── shot.png
├── shuttledeck/
│   ├── index.html
│   └── splash.png
├── sky-car-stunt/
│   ├── index.html
│   └── 512x512.jpg
├── sleepingbeauty/
│   ├── index.html
│   └── splash.png
├── slime-rush-td/
│   ├── index.html
│   └── splash.png
├── slitherio/
│   ├── slitherio.html
│   └── splash.jpeg
├── slope/
│   ├── index.html
│   └── slope4.jpeg
├── slope-2/
│   ├── index.html
│   └── slope-2-logo.png
├── slope-ball/
│   ├── index.html
│   └── splash.png
├── sm64/
│   ├── index.html
│   └── logo.png
├── smashkarts/
│   ├── index.html
│   └── images/smashkarts.png
├── smokingbarrels/
│   ├── index.html
│   └── smokingbarrels.jpg
├── snowbattle/
│   ├── index.html
│   └── img/logo.png
├── snowrider3d/
│   ├── index.html
│   └── images/logo.png
├── soccer-random/
│   ├── index.html
│   └── splash.png
├── soccer-skills/
│   ├── index.html
│   └── splash.png
├── soldier-legend/
│   ├── index.html
│   └── images/splash.jpeg
├── solitaire/
│   ├── index.html
│   └── screen-shot.png
├── sort-the-court/
│   ├── index.html
│   └── img/splash.png
├── soundboard/
│   ├── index.html
│   └── img/mlg.png
├── space-company/
│   ├── index.html
│   └── loadScreenPic.png
├── spacegarden/
│   ├── index.html
│   └── spl.png
├── spelunky/
│   ├── index.html
│   └── icon.png
├── spinningrat/
│   └── index.html
├── squaredash/
│   └── index.html
├── ssurferbotleg/
│   └── index.html
├── stack/
│   ├── index.html
│   └── stack.png
├── stack-bump-3d/
│   ├── index.html
│   └── thumbnail.jpg
├── starve/
│   └── index.html
├── station-141/
│   ├── index.html
│   └── icon.png
├── stationmeltdown/
│   ├── index.html
│   └── image.png
├── stealingthediamond/
│   ├── index.html
│   └── stealingthediamond.jpg
├── stick-archers/
│   ├── index.html
│   └── splash.jpg
├── stick-duel-battle/
│   └── index.html
├── stick-merge/
│   ├── index.html
│   └── splash.png
├── stickman-boost/
│   ├── index.html
│   └── icon-256.png
├── stickman-golf/
│   ├── index.html
│   └── splash.png
├── stickman-hook/
│   ├── index.html
│   └── unnamed.jpg
├── Stickman-Survival/
│   ├── index.html
│   └── Icon.png
├── stickwar/
│   ├── index.html
│   └── stickwar.jpg
├── stormthehouse2/
│   ├── index.html
│   └── stormthehouse2.jpg
├── stumble-guys/
│   ├── index.html
│   └── stumble-guys.jpeg
├── subway-surfers/
│   ├── index.html
│   └── img/splash.jpg
├── subway-surfers-ny/
│   ├── index.html
│   └── NewYorkIcon.png
├── suggestions/
│   └── index.html
├── superautopets/
│   ├── index.html
│   └── image.png
├── superfowlist/
│   ├── index.html
│   └── fowlist.png
├── superhot/
│   ├── index.html
│   └── hot.jpg
├── supermarioconstruct/
│   ├── index.html
│   └── icons/icon-256.png
├── surviv/
│   └── index.html
├── sushi-unroll/
│   └── index.html
├── swarmsimulator/
│   └── Swarm Simulator.html
├── swerve/
│   └── index.html
├── synesthesia/
│   ├── index.html
│   └── index.splash.png
├── tactical-weapon-pack-2/
│   ├── index.html
│   └── splash.jpg
├── tacticalassasin2/
│   ├── index.html
│   └── tacticalassassin2.png
├── tank-trouble-2/
│   ├── index.html
│   └── tank.jpeg
├── tanuki-sunset/
│   ├── index.html
│   └── img/cover.png
├── temple-run-2/
│   ├── index.html
│   └── img/cover.png
├── the-final-earth/
│   └── index.html
├── the-final-earth-2/
│   ├── index.html
│   └── thumb.png
├── the-hotel/
│   ├── index.html
│   └── splash.png
├── thebattle/
│   ├── index.html
│   └── thebattle.png
├── theheist/
│   ├── index.html
│   └── theheist.jpg
├── there-is-no-game/
│   ├── index.html
│   └── images/splash.png
├── thisistheonlylevel/
│   ├── index.html
│   └── thisistheonlylevel.png
├── throwrocks/
│   └── index.html
├── tiny-fishing/
│   ├── index.html
│   └── tiny-fishing.png
├── tiny-islands/
│   ├── index.html
│   └── splash.png
├── tosstheturtle/
│   ├── index.html
│   └── tosstheturtle.png
├── townscaper/
│   ├── index.html
│   └── img/cover.jpg
├── Trimps/
│   ├── index.html
│   └── trimp.jpg
├── tube-jumpers/
│   ├── index.html
│   └── img/icon.jpg
├── tunnel-rush/
│   ├── index.html
│   └── img/tunnel.jpg
├── tv-static/
│   ├── index.html
│   └── static.png
├── twitch-tetris/
│   ├── index.html
│   └── logo.png
├── unfairmario/
│   ├── index.html
│   └── sus.jpg
├── veloce/
│   ├── index.html
│   └── icon.png
├── vex2/
│   ├── vex2.html
│   └── splash.jpeg
├── vex3/
│   ├── index.html
│   └── vex3.png
├── vex4/
│   ├── index.html
│   └── vex4.png
├── vex5/
│   ├── index.html
│   └── vex.jpeg
├── vex6/
│   ├── index.html
│   └── icon.png
├── vex7/
│   ├── index.html
│   └── assets/images/logo.png
├── volley-random/
│   ├── index.html
│   └── splash.png
├── wallsmash/
│   ├── index.html
│   └── thumb.png
├── waterworks/
│   └── waterworks/
│       ├── index.html
│       └── splash.png
├── weavesilk/
│   ├── index.html
│   └── thumb.png
├── webcleaner/
│   └── index.html
├── webgl-fluid-simulation/
│   ├── index.html
│   └── logo.png
├── webretro/
│   └── index.html
├── webxash/
│   ├── index.html
│   └── assets/webxash.png
├── win-the-whitehouse/
│   ├── index.html
│   └── splash.png
├── wolf2d/
│   └── index.html
├── wolf3d/
│   ├── index.html
│   └── art/wolf3d.png
├── wordle/
│   └── index.html
├── worlds-hardest-game/
│   ├── index.html
│   └── images/splash.jpg
├── worlds-hardest-game-2/
│   ├── index.html
│   └── the-worlds-hardest-game-2.jpg
├── wounded-summer-baby-edition/
│   └── index.html
├── x-trial-racing/
│   ├── index.html
│   └── splash.png
├── xx142-b2exe/
│   ├── index.html
│   └── splash.png
├── yohoho/
│   ├── index.html
│   └── yohoho.png
├── yoshifabrication/
│   └── index.html
├── you-are-bezos/
│   ├── index.html
│   └── img/banner.png
├── zigzag/
│   ├── zigzag.html
│   └── 4EEE71BF-A06E-478D-B1E0-F67600291BDC.jpeg
└── zombs-royale/
    ├── index.html
    └── zomb.png
`;

const lines = treeText.split('\n').filter(Boolean);
const gamesMap = {};
let currentDir = null;

for (let line of lines) {
    if (line.startsWith('├── ') || line.startsWith('└── ')) {
        const name = line.replace(/^[├└]── /, '').replace(/\/$/, '');
        if (!name.includes('.')) {
            currentDir = name;
            gamesMap[currentDir] = [];
        }
    } else if (line.startsWith('│   ├── ') || line.startsWith('│   └── ') || line.startsWith('    ├── ') || line.startsWith('    └── ')) {
        if (currentDir) {
            const file = line.replace(/^[│ ]+ [├└]── /, '');
            gamesMap[currentDir].push(file);
        }
    }
}

const games = [];
const commitHash = 'f269ea64b9e2ff923e59ab3ea7c6b4b57c437af2';
const baseUrl = `https://rawcdn.githack.com/GalacticNetwork/3kh0-assets/${commitHash}/`;

const colors = [
  'from-purple-500 to-pink-500',
  'from-lime-500 to-emerald-500',
  'from-blue-500 to-cyan-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-purple-500',
  'from-amber-500 to-orange-500'
];

let colorIndex = 0;

for (let [dir, files] of Object.entries(gamesMap)) {
    let htmlFile = files.find(f => f.endsWith('.html'));
    
    if (htmlFile) {
        let imgFile = files.find(f => f.match(/\.(png|jpg|jpeg|gif|webp)$/i));
        
        let title = dir.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        games.push({
            id: dir,
            title: title,
            url: baseUrl + dir + '/' + htmlFile,
            image: imgFile ? (baseUrl + dir + '/' + imgFile) : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=60',
            category: 'Arcade',
            players: Math.floor(Math.random() * 900 + 10) + 'k',
            status: 'ONLINE',
            color: colors[colorIndex % colors.length]
        });
        colorIndex++;
    }
}

fs.writeFileSync('src/externalGames.json', JSON.stringify(games, null, 2));
console.log(`Extracted ${games.length} games!`);
