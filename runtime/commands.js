var config = require("../config.json");
var userDB = require("./user_rt.js");
var serverDB = require("./server_rt.js");
var permissionDB = require("./permission_rt.js");
var factionDB = require("./faction_rt.js");
var mangaDB = require("./manga_track_rt.js");
var functions = require("./functions.js");

var aniscrape = require("aniscrape");
var kissanime = require("aniscrape-kissanime")
var nani = require("nani").init(config.anilistID, config.anilist_Secret);
var nedb = require("nedb")
var request = require("request");
var youtubeNode = require("youtube-node");
var ytdl = require("ytdl-core");
var Commands = [];

Commands.help = {
	name: "help",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg) {
  	bot.reply(msg, "https://github.com/RoddersGH/DekuBot/wiki/General-Commands");
  }
};

Commands.ping = {
	name: "ping",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg) {
  	bot.reply(msg, "pong");
  }
};

Commands.purge = {
	name: "purge",
	help: "tbd",
	type: "admin",
	lvl: 1,
	func: function(bot, msg, args) {
    if (!msg.channel.server) {
      bot.sendMessage(msg.channel, "You can't do that in a DM you silly silly person!");
      return;
    }
    if (!args || isNaN(args)) {
      bot.sendMessage(msg.channel, "Please define an amount of messages for me to delete!");
      return;
    }
    if (!msg.channel.permissionsOf(msg.sender).hasPermission("manageMessages")) {
      bot.sendMessage(msg.channel, "Your role in this server does not have enough permissions.");
      return;
    }
    if (!msg.channel.permissionsOf(bot.user).hasPermission("manageMessages")) {
      bot.sendMessage(msg.channel, "I don't have permission to do that!");
      return;
    }
    if (args > 50) {
      bot.sendMessage(msg.channel, "The maximum is 50.");
      return;
    }
    bot.getChannelLogs(msg.channel, args, function(error, messages) {
      if (error) {
        bot.sendMessage(msg.channel, "Something went wrong while getting logs thing.");
        return;
      } else {
        var msgsleft = messages.length,
          delcount = 0;
        for (msg of messages) {
          bot.deleteMessage(msg);
          msgsleft--;
          delcount++;
          if (msgsleft === 0) {
            bot.sendMessage(msg.channel, "Done! Deleted " + delcount + " messages.");
            return;
          }
        }
      }
    });
  }
};

Commands.namechanges = {
	name: "namechanges",
	help: "tbt",
	type: "general",
	lvl: 0,
	func: function(bot, msg) {
		if ((msg.mentions.length === 0) || (msg.mentions.length > 1)) {
			bot.sendMessage(msg.channel, "Please mention a single user.");
		} else {
			msg.mentions.map(function(user) {
	      userDB.returnNamechanges(user).then(function(reply) {
	        bot.sendMessage(msg.channel, reply.join(', '));
	      }).catch(function(err) {
	        if (err === 'No changes found!') {
	          bot.sendMessage(msg.channel, "I don't have any changes registered.");
	          return;
	        }
	        bot.sendMessage(msg.channel, 'Something went wrong, try again later.');
	      });
	    });
		}
  }
};

Commands.botstatus = {
	name: "botstatus",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg) {
		var channelcount = 0;
		var usercount = 0;
		var finalstring = [];

		for (server of bot.servers) {
			for (channel of server.channels ) {
				channelcount++;
			};
			for (member of server.members) {
				usercount++;
			};
		};

		finalstring.push("Hi! Im DekuBot.");
		finalstring.push("Im currently used in " + bot.servers.length + " server(s), in " + channelcount + " channels used by " + usercount + " users.");
		finalstring.push("I've been up and ready for " + (Math.round(bot.uptime / (1000 * 60 * 60))) + " hours, " + (Math.round(bot.uptime / (1000 * 60)) % 60) + " minutes, and " + (Math.round(bot.uptime / 1000) % 60 + ".") + " seconds.");
	  finalstring.push("If you have any questions or need some help, contact **RoddersGH#4702**")
		finalstring.push("```         __    __");
		finalstring.push("        /  |  | |'-.");
		finalstring.push("       .|__/  | |   |");
		finalstring.push("    _ /  `._  |_|_.-'");
		finalstring.push("   | /  |__.`=._) (_");
		finalstring.push('   |/ ._/  |"""""""""|');
		finalstring.push("   |'.  ` )|         |");
		finalstring.push('   ;"""/ / |         |');
		finalstring.push("    ) /_/| |.-------.|");
		finalstring.push("   o  `-`o o         o	```");
		bot.sendMessage(msg.channel, finalstring);
  }
};

Commands.serverspoilertoggle = {//USELESS
	name: "serverspoilertoggle",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args, lvl) {
	  if (msg.channel.permissionsOf(msg.sender).hasPermission("manageServer")) {
			serverDB.togglespoiler(msg.channel.server.id);
	  } else {
			bot.sendMessage(msg.channel, "Your role in this server does not have enough permissions.")
	  }
  }
};

Commands.getpermissionlvl = {
	name: "getpermissionlvl",
	help: "tbd",
	type: "admin",
	lvl: 1,
	func: function(bot, msg, args, lvl) {
		if ((msg.mentions.length === 0) || (msg.mentions.length > 1)) {
			bot.reply(msg, "Please mention a user");
		} else {
			permissionDB.getPermission(msg.channel.server.id, msg.mentions[0].id).then(function(r) {
				bot.sendMessage(msg.channel, r);
			});
		}
  }
};

Commands.setpermissionlvl = {
	name: "setpermissionlvl",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args, lvl) {
		var num = args.substr(args.indexOf(" ") + 1)
		var isnum = /^\d+$/.test(num);
		if ((msg.mentions.length === 0) || (msg.mentions.length > 1)) {
			bot.reply(msg, "Please mention a user");
			return;
		} else {
			if (!num || isnum == false || (num == 4) || (num == 5) || (num < 0) || (num > 6)) {
				bot.sendMessage(msg.channel, "Please define the permission level you wish to set for the user.");
				return;
			} else {
				permissionDB.check(msg.channel.server.id, msg.mentions[0].id).catch(function(e) {
					console.log(e);
					if (e == 'Nothing found!') {
						permissionDB.newPermission(msg.channel.server, msg.mentions[0]);
					};
				});
				permissionDB.getPermission(msg.channel.server.id, msg.author.id).then(function(r) {
					permissionDB.setPermission(r, msg.channel.server, msg.mentions[0], num).then(function(res) {
						bot.sendMessage(msg.channel, msg.mentions[0] + res);
					}).catch(function(e) {
						bot.sendMessage(msg.channel, e);
					});
				}).catch(function(e) {
					console.log(e);
				});
			}
	  }
  }
};

Commands.createfaction = {
	name: "createfaction",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args, lvl) {
		var name = args.substr(0, args.indexOf("#") - 1)
		var hex = args.substr(args.indexOf("#"))
		var isHex = /^#[0-9A-F]{6}$/i.test(hex);

		if (isHex == false) {
			bot.sendMessage(msg.channel, "Please enter a valid Hex value of the format #<six digit hex number>.");
			return;
		};
		factionDB.checkNameClash(msg.channel.server, name).then(function() {
			var hex_int = parseInt("0x" + hex.substr(hex.indexOf("#") + 1), 16);
			factionDB.createNewFaction(msg.channel.server, name, hex);
			bot.createRole(msg.server, {
				color : hex_int,
				hoist : false,
				name : name,
				permissions : [
					"attachFiles", "sendMessages", "readMessages", "embedLinks", "readMessageHistory", "createInstantInvite", "changeNickname", "voiceConnect", "voiceSpeak", "voiceUseVAD"
				],
				mentionable: false
			}, function(err, role) {
				if (err) {
					bot.sendMessage(msg.channel, err);
				}
			});
			bot.sendMessage(msg.channel, "The faction " + name + " has been created.");
		}).catch(function(e) {
			bot.sendMessage(msg.channel, e);
			return;
		});
  }
};

Commands.manualjoinfaction = {
	name: "manualjoinfaction",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args, lvl) {
		var name = args.substr(args.indexOf(" ") + 1)
		var exitloop2 = false;
		if ((msg.mentions.length === 0) || (msg.mentions.length > 1)) {
			bot.reply(msg, "Please mention a user");
			return;
		} else {
			if (!name) {
				bot.sendMessage(msg.channel, "Please define the faction you wish the user to join.");
				return;
			} else {
				factionDB.getFactionsHere(msg.channel.server).then(function(r) {     //r is servers factions
					for (factionid of r) {
						if (exitloop2 == true) {
							break;
						};
						factionDB.getFactionName(factionid).then(function(v) {
							if (v == name) {
								userDB.getFactionIDs(msg.mentions[0]).then(function(q){
									for (facid of q) {
										factionDB.getFactionID(msg.channel.server.id, v).then(function(j) { //j is id of a given server faction
										if ((j == facid) || (facid = r[0]) || (facid = r[1]) || (facid = r[2])) {
											bot.sendMessage(msg.channel, "The user is already in a faction on this server.");
											return;
										} else {
											userDB.addToFaction(msg.mentions[0], j);
											bot.sendMessage(msg.channel, "The user has successfully been added to " + name);
										};
										});
									};
								}).catch(function(e) {
									if (e == 'No factions found!') {
											factionDB.getFactionID(msg.channel.server.id, v).then(function(m) {
												userDB.addToFaction(msg.mentions[0], m);
												bot.sendMessage(msg.channel, "The user has successfully been added to " + name);
											});
									}
								});
								exitloop2 = true;
							};
						});
					}

				}).catch(function(e) {
					bot.sendMessage(msg.channel, e);
				});
			}
	  }
  }
};

Commands.manualleavefaction = {
	name: "manualleavefaction",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args, lvl) {
		var name = args.substr(args.indexOf(" ") + 1)
		exitloop = false;
		if ((msg.mentions.length === 0) || (msg.mentions.length > 1)) {
			bot.reply(msg, "Please mention a user");
			return;
		} else {
			if (!name) {
				bot.sendMessage(msg.channel, "Please define the faction you wish the user to leave.");
				return;
			} else {
				factionDB.getFactionsHere(msg.channel.server).then(function(r) {
					for (factionid of r) {
						factionDB.getFactionName(factionid).then(function(v) {
							if (v == name) {
								userDB.getFactionIDs(msg.mentions[0]).then(function(q){
									for (facid of q) {
										if (exitloop = true) {
											break;
										};
										factionDB.getFactionID(msg.channel.server.id, v).then(function(j) { //j is id of a given server faction
										if (j == facid) {
											userDB.removeFromFaction(msg.mentions[0], j);
											bot.sendMessage(msg.channel, "The user has successfully been removed from " + name);

											exitloop = true;
											return;
										};
										});
									};
								}).catch(function(e) {
									if (e == 'No factions found!') {
										bot.sendMessage(msg.channel, "The user is not in any faction");
										exitloop = true;
									}
								})

							}
						})
					}
					if (exitloop == false) {
						bot.sendMessage(msg.channel, "The user is not a member of the faction " + name);
					}
				})
			}
	  }
  }
};

Commands.faction = {
	name: "faction",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg, args, lvl) {
	  var msgArray = [];
	  var serverFactions = [];
	  var userFactions = [];
	  factionDB.getFactionsHere(msg.server).then(function(serverFactions) {
		  userDB.getFactionIDs(msg.author).then(function(userFactions) {
				for (m of serverFactions) {
						for (n of userFactions) {
								if (m == n) {
									bot.sendMessage(msg.author, "Sorry, you are already in a faction :heart:", {}, function(err, sentmsg) {
										if (err) {
											console.log(err);
										}
									});
									return;
								} else {
									msgArray.push("Hello member of the " + msg.channel.server.name + " server");
								    msgArray.push("Im a new addition to the server made by the Admin @Rodders. I help with a bunch of things which you can check out by going to the following link ");
									msgArray.push("I hope you continue to have lots of fun discussing one piece with us!");
									msgArray.push("(If this message was an annoyance or was not intended for you then I sincerely apologise and would ask you to contact @Rodders on the server with any issues)");
									msgArray.push(" ");
									msgArray.push("We have different factions on the server that give you access to exclusive channels and faction leaderboards(still being made )!");
									msgArray.push("**If you want to join a faction, type the number next to the faction you wish to join.**" );
									msgArray.push("The factions are:" );
									msgArray.push("1. Pirates" );
									msgArray.push("2. Marines" );
									msgArray.push("3. Revolutionary Army" );

									bot.sendMessage(msg.author, msgArray, {}, function(err, sentmsg) {
										sentmsg.author = msg.author
										functions.responseHandling(bot, sentmsg, "**Which faction would you like to join?**", msg.author, msg.server);
									});
								}
						}
				}
		  }).catch (function(e) {
			  if (e == 'No factions found!') {
					msgArray.push("Hello member of the " + msg.channel.server.name + " server");
					msgArray.push("Im a new addition to the server made by the Admin @Rodders. I help with a bunch of things which you can check out by going to the following link ");
					msgArray.push("I hope you continue to have lots of fun discussing one piece with us!");
					msgArray.push("(If this message was an annoyance or was not intended for you then I sincerely apologise and would ask you to contact @Rodders on the server with any issues)");
					msgArray.push(" ");
					msgArray.push("We have different factions on the server that give you access to exclusive channels and faction leaderboards(still being made )!");
					msgArray.push("**If you want to join a faction, type the number next to the faction you wish to join.**" );
					msgArray.push("The factions are:" );
					msgArray.push("1. Pirates" );
					msgArray.push("2. Marines" );
					msgArray.push("3. Revolutionary Army" );

					bot.sendMessage(msg.author, msgArray, {}, function(err, sentmsg) {
						sentmsg.author = msg.author
						functions.responseHandling(bot, sentmsg, "**Which faction would you like to join?**", msg.author, msg.server);
					});
			  }
		  });
	  });
  }
};

Commands.ignore = {
	name: "ignore",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args, lvl) {
		serverDB.ignoreChannel(msg.channel).then(function(r) {
			bot.reply(msg, r);
		}).catch(function(e) {
			bot.reply(msg, e);
		})
  }
};

Commands.unignore = {
	name: "unignore",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args, lvl) {
		serverDB.unignoreChannel(msg.channel).then(function(r) {
			bot.reply(msg, r);
		}).catch(function(e) {
			bot.reply(msg, e);
		})
  }
};

Commands.anime = {
	name: "anime",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		nani.get('anime/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "Nothing found");
				return
			} else {
				nani.get('anime/' + r[0].id).then(function(data) {
					bot.sendMessage(msg.channel, 'http://anilist.co/anime/' + data.id + "   " + data.image_url_lge, function(err, message) {
						var msgArray = [];
						msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
						msgArray.push("**Type: **" + data.type);
						msgArray.push("**Genres: **" + data.genres);
						msgArray.push("**Score: **" + data.average_score);
						msgArray.push("**Status: **" + data.airing_status);
						if (data.total_episodes != 0) {
							msgArray.push("**# of Episodes: **" + data.total_episodes);
						}
						msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
						if (data.end_date) {
							msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
						}
						var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
						msgArray.push("**Description: **" + cleanText);
						bot.sendMessage(msg.channel, msgArray);
					});
				}).catch(function(e) {
					console.log(e);
				});
			}
		}).catch(function(e) {
			console.log(e);
		});
  }
};

Commands.manga = {
	name: "manga",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		nani.get('manga/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "Nothing found");
				return
			} else {
				nani.get('manga/' + r[0].id).then(function(data) {
					bot.sendMessage(msg.channel, 'http://anilist.co/manga/' + data.id + "   " + data.image_url_lge, function(err, message) {
						var msgArray = [];
						msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
						msgArray.push("**Type: **" + data.type);
						msgArray.push("**Genres: **" + data.genres);
						msgArray.push("**Score: **" + data.average_score);
						msgArray.push("**Status: **" + data.airing_status);
						if (data.total_chapters != 0) {
							msgArray.push("**# of Chapters: **" + data.total_chapters + " In " + data.total_volumes + " Volumes.");
						}
						msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
						if (data.end_date) {
							msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
						}
						var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
						msgArray.push("**Description: **" + cleanText);
						bot.sendMessage(msg.channel, msgArray);
					});
				}).catch(function(e) {
					console.log(e);
				});
			}
		}).catch(function(e) {
			console.log(e);
		});
  }
};

Commands.character = {
	name: "character",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		nani.get('character/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "Nothing found");
				return
			} else {
				var msgArray1 = [];
				if (r.length > 1 ) {
					for (i = 0; i < r.length; i++) {
						msgArray1.push("[ " + (i+1) + " ]  -  " + r[i].name_last + " " + r[i].name_first);
					}
				} else if (r.length == 1) {
				nani.get('character/' + r[0].id).then(function(data) {
					bot.sendMessage(msg.channel, 'http://anilist.co/character/' + data.id + "   " + data.image_url_lge, function(err, message) {
						var msgArray = [];
						msgArray.push("**Names: **" + data.name_last + " " + data.name_first + ", " + data.name_alt + ", " + data.name_japanese);
						var a = data.info.replace(/__/g, "**");
						var b = a.replace(/~!/g, " ");
						var c = b.replace(/!~/g, " ");
						if (data.info.length >= 1600) {
							msgArray.push("**Description: **\n\n" + c.substr(0, 1600) + "...       _click the first link above to read more_");
						} else {
							msgArray.push("**Description: **\n\n" + c);
						}

						bot.sendMessage(msg.channel, msgArray);
					});
				}).catch(function(e) {
					console.log(e);
				});
				return;
				}
				bot.sendMessage(msg.channel, "**Please choose one be giving a number:**", function(err, mesg){
					mesg.author = msg.author
					functions.responseHandlingREG(bot, mesg, msgArray1, msg.author).then(function(num){
						if (num > 0 && num <= r.length && num.length <= 2) {
							nani.get('character/' + r[num-1].id).then(function(data) {
								bot.sendMessage(msg.channel, 'http://anilist.co/character/' + data.id + "   " + data.image_url_lge, function(err, message) {
									var msgArray = [];
									msgArray.push("**Names: **" + data.name_last + " " + data.name_first + ", " + data.name_alt + ", " + data.name_japanese);
									var a = data.info.replace(/__/g, "**");
									var b = a.replace(/~!/g, " ");
									var c = b.replace(/!~/g, " ");
									var d = c.replace(/&#039;/, "'")
									if (data.info.length >= 1600) {
										msgArray.push("**Description: **\n\n" + d.substr(0, 1600) + "...       _click the first link above to read more_");
									} else {
										msgArray.push("**Description: **\n\n" + d);
									}

									bot.sendMessage(msg.channel, msgArray);
								});
							}).catch(function(e) {
								console.log(e);
							});
						}
					}).catch(function(e) {
						console.log(e);
					});

				});
			}
		}).catch(function(e) {
			console.log(e);
		});
  }
};

Commands.animesearch = {
	name: "animesearch",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		nani.get('anime/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "Nothing found");
				return
			} else {
				var msgArray1 = [];
				if (r.length > 1 ) {
					for (i = 0; i < r.length; i++) {
						msgArray1.push("[ " + (i+1) + " ]  -  " + r[i].title_english);
					}
				} else if (r.length == 1) {
				nani.get('anime/' + r[0].id).then(function(data) {
					bot.sendMessage(msg.channel, 'http://anilist.co/anime/' + data.id + "   " + data.image_url_lge, function(err, message) {
						var msgArray = [];
						msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
						msgArray.push("**Type: **" + data.type);
						msgArray.push("**Genres: **" + data.genres);
						if (data.average_score == 0) {
							msgArray.push("**Score: **Undecided" );
						} else {
							msgArray.push("**Score: **" + data.average_score);
						}
						msgArray.push("**Status: **" + data.airing_status);
						if (data.total_episodes != 0) {
							msgArray.push("**# of Episodes: **" + data.total_episodes);
						}
						msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
						if (data.end_date) {
							msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
						}
						if (data.description) {
							var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
							msgArray.push("**Description: **" + cleanText);
						}
						bot.sendMessage(msg.channel, msgArray);
					});
				}).catch(function(e) {
					console.log(e);
				});
				return;
				}
				bot.sendMessage(msg.channel, "**Please choose one be giving a number:**", function(err, mesg){
					mesg.author = msg.author
					functions.responseHandlingREG(bot, mesg, msgArray1, msg.author).then(function(num){
						if (num > 0 && num <= r.length && num.length <= 2) {
							nani.get('anime/' + r[num-1].id).then(function(data) {
								bot.sendMessage(msg.channel, 'http://anilist.co/anime/' + data.id + "   " + data.image_url_lge, function(err, message) {
									var msgArray = [];
									msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
									msgArray.push("**Type: **" + data.type);
									msgArray.push("**Genres: **" + data.genres);
									if (data.average_score == 0) {
										msgArray.push("**Score: **Undecided" );
									} else {
										msgArray.push("**Score: **" + data.average_score);
									}
									msgArray.push("**Status: **" + data.airing_status);
									if (data.total_episodes != 0) {
										msgArray.push("**# of Episodes: **" + data.total_episodes);
									}
									msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
									if (data.end_date) {
										msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
									}
									if (data.description) {
										var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
										msgArray.push("**Description: **" + cleanText);
									}
									bot.sendMessage(msg.channel, msgArray);
								});
							}).catch(function(e) {
								console.log(e);
							});
						}
					}).catch(function(e) {
						console.log(e);
					});

				});
			}
		}).catch(function(e) {
			console.log(e);
		});
  }
};

Commands.mangasearch = {
	name: "mangasearch",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		nani.get('manga/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "Nothing found");
				return
			} else {
				var msgArray1 = [];
				if (r.length > 1 ) {
					for (i = 0; i < r.length; i++) {
						msgArray1.push("[ " + (i+1) + " ]  -  " + r[i].title_english);
					}
				} else if (r.length == 1) {
					nani.get('manga/' + r[0].id).then(function(data) {
						bot.sendMessage(msg.channel, 'http://anilist.co/manga/' + data.id + "   " + data.image_url_lge, function(err, message) {
							var msgArray = [];
							msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
							msgArray.push("**Type: **" + data.type);
							msgArray.push("**Genres: **" + data.genres);
							msgArray.push("**Score: **" + data.average_score);
							msgArray.push("**Status: **" + data.airing_status);
							if (data.total_chapters != 0) {
								msgArray.push("**# of Chapters: **" + data.total_chapters + " In " + data.total_volumes + " Volumes.");
							}
							msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
							if (data.end_date) {
								msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
							}
							var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
							msgArray.push("**Description: **" + cleanText);
							bot.sendMessage(msg.channel, msgArray);
						});
					}).catch(function(e) {
						console.log(e);
					});
				return;
				}
				bot.sendMessage(msg.channel, "**Please choose one be giving a number:**", function(err, mesg){
					mesg.author = msg.author
					functions.responseHandlingREG(bot, mesg, msgArray1, msg.author).then(function(num){
						if (num > 0 && num <= r.length && num.length <= 2) {
							nani.get('manga/' + r[num-1].id).then(function(data) {
								bot.sendMessage(msg.channel, 'http://anilist.co/manga/' + data.id + "   " + data.image_url_lge, function(err, message) {
									var msgArray = [];
									msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
									msgArray.push("**Type: **" + data.type);
									msgArray.push("**Genres: **" + data.genres);
									msgArray.push("**Score: **" + data.average_score);
									msgArray.push("**Status: **" + data.airing_status);
									if (data.total_chapters != 0) {
										msgArray.push("**# of Chapters: **" + data.total_chapters + " In " + data.total_volumes + " Volumes.");
									}
									msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
									if (data.end_date) {
										msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
									}
									var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
									msgArray.push("**Description: **" + cleanText);
									bot.sendMessage(msg.channel, msgArray);
								});
							}).catch(function(e) {
								console.log(e);
							});
						}
					}).catch(function(e) {
						console.log(e);
					});
				});
			}
		}).catch(function(e) {
			console.log(e);
		});
  }
};

Commands.animeairdate = {
	name: "animeairdate",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		nani.get('anime/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "Nothing found");
				return
			} else {
				nani.get('anime/' + r[0].id).then(function(data) {
					bot.sendMessage(msg.channel, 'http://anilist.co/anime/' + data.id + "   " + data.image_url_lge, function(err, message) {
						var msgArray = [];
						console.log(data.airing_status);
						if (data.airing_status == 'finished airing' || data.airing_status == 'not yet aired') {
							msgArray.push("**Status: **" + data.airing_status);
						} else {
							var date = new Date(null);
							date.setSeconds(data.airing.countdown); // specify value for SECONDS here
							var formattedDate = date.toISOString().substr(8,2)-1 + " Days, " + date.toISOString().substr(11,2) + " Hours, " + date.toISOString().substr(14,2) + " Minutes"

							msgArray.push("**Next Episode: **" + data.airing.next_episode);
							msgArray.push("**Airing On: **" + data.airing.time.substr(0, 10));
							msgArray.push("**Countdown: ** :hourglass_flowing_sand: " + formattedDate);
						}

						bot.sendMessage(msg.channel, msgArray);
					});
				}).catch(function(e) {
					console.log(e);
				});
			}
		}).catch(function(e) {
			console.log(e);
		});
  }
};

Commands.track = {
	name: "track",
	help: "tbd",
	type: "weeb",
	lvl: 3,
	func: function(bot, msg, args, lvl) {
		var url = args;
		var mangatag = url.substr(29);
		request(url, function(error, response, body) {
			if (body.search( '<a href="http://mangastream.com/r/' + mangatag + '/') !== -1) {
				var n = body.search( 'http://mangastream.com/r/' + mangatag + '/')
				mangaDB.trackManga(url, body.substr(n+35, 3), msg);
			}
		})
  }
};

exports.Commands = Commands;
