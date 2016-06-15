( function () {
	"use strict";
	String.prototype.capFirst = function () {
		return this.charAt( 0 ).toUpperCase() + this.slice( 1 );
	}
	var dayNames = [ 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс' ];
	Date.prototype.getLocaleDay = function ( locale ) {
		if ( locale == 'ru' ) {
			return dayNames.indexOf( this.toLocaleString( locale, {
				weekday: 'short'
			} ) );
		} else {
			return this.getDay();
		}
	};

	Date.prototype.getWeek = function (fromYear) {
		var date = new Date( this.getTime() );
		date.setHours( 0, 0, 0, 0 );
		// Thursday in current week decides the year.
		date.setDate( date.getDate() + 3 - ( date.getDay() + 6 ) % 7 );
		// January 4 is always in week 1.
		fromYear = fromYear || date.getFullYear();
		var week1 = new Date( date.getFullYear(), 0, 4 );
		// Adjust to Thursday in week 1 and count number of weeks from date to week1.
		return 1 + Math.round( ( ( date.getTime() - week1.getTime() ) / 86400000 -
			3 + ( week1.getDay() + 6 ) % 7 ) / 7 );
	}

	Date.prototype.getWeek2 = function ( dowOffset, fromYear ) {
		var fromYear = fromYear || this.getFullYear();

		dowOffset = typeof dowOffset == 'number' ? dowOffset : 0; //default dowOffset to zero
		var newYear = new Date( fromYear, 0 );
		var day = newYear.getDay() - dowOffset; //the day of week the year begins on
		day = ( day >= 0 ? day : day + 7 );
		var daynum = Math.floor( ( this.getTime() - newYear.getTime() -
			( this.getTimezoneOffset() - newYear.getTimezoneOffset() ) * 60000 ) / 86400000 ) + 1;
		var weeknum;
		//if the year starts before the middle of a week
		if ( day < 4 ) {
			weeknum = Math.floor( ( daynum + day - 1 ) / 7 ) + 1;
			if ( weeknum > 52 ) {
				var nYear = new Date( fromYear + 1, 0, 1 );
				var nday = nYear.getDay() - dowOffset;
				nday = nday >= 0 ? nday : nday + 7;
				/*if the next year starts before the middle of
				  the week, it is week #1 of that year*/
				weeknum = nday < 4 ? 1 : 53;
			}
		} else {
			weeknum = Math.floor( ( daynum + day - 1 ) / 7 );
		}
		return weeknum;
	};

	Date.prototype.getWeek1 = function ( locale, startYear ) {
		var onejan = new Date( startYear || this.getFullYear(), 0 );
		return Math.ceil( ( ( ( this - onejan ) / 86400000 ) + onejan.getLocaleDay( locale ) + 1 ) / 7 ) - 1;
	};

	function Day( d, e ) {
		this.d = d;
		this.e = e;
	};

	function Calendar( opts ) {
		if ( !( this instanceof Calendar ) ) return new Calendar( opts );

		var self = this;
		this.now = new Date();

		opts = Object.assign( {
			current: this.now,
			locale: 'en-us',
			events: ko.observableArray( [ {
				title: 'МуМу',
				tmpl: 'event',
				time: new Date( 2016, 3, 16, 13, 40 )
			} ] )
		}, opts );

		this.dayNames = dayNames;

		this.locale = opts.locale;
		this.events = opts.events;
		this.current = ko.observable( opts.current );

		this.page = {
			_date: ko.observable( new Date( this.current().getFullYear(), this.current().getMonth() ) )
		};
		Object.defineProperties( this.page, {
			monthName: {
				enumerable: true,
				get: function () {
					return new Date( this.year, this.month ).toLocaleString( self.locale, {
						month: 'long'
					} ).capFirst();
				}
			},
			year: {
				enumerable: true,
				get: function () {
					return this._date().getFullYear();
				}
			},
			month: {
				enumerable: true,
				get: function () {
					return this._date().getMonth();
				},
				set: function ( val ) {
					this._date( new Date( this._date().getFullYear(), val ) );
				}
			},
			curDays: {
				enumerable: true,
				get: function () {
					var lastDay = parseInt( new Date( this.year, this.month + 1, 0 ).toLocaleString( self.locale, {
						day: 'numeric'
					} ) );
					var days = new Array( lastDay ).fill( 0 );
					return days.map( function ( v, i ) {
						return new Date( self.page.year, self.page.month, ++i );
					} );
				}
			},
			prevDays: {
				enumerable: true,
				get: function () {
					var lastDay = parseInt( new Date( this.year, this.month, 0 ).toLocaleString( self.locale, {
						day: 'numeric'
					} ) );
					var days = new Array( 14 ).fill( 0 );
					var i = 1;
					return days.map( function ( v, i ) {
						return new Date( self.page.year, self.page.month - 1, lastDay - 14 + ++i );
					} );
				}
			},
			nextDays: {
				enumerable: true,
				get: function () {
					var days = new Array( 14 ).fill( 0 );
					return days.map( function ( v, i ) {
						return new Date( self.page.year, self.page.month + 1, ++i );
					} );
				}
			},
			days: {
				enumerable: true,
				get: function () {
					return this.prevDays.concat( this.curDays, this.nextDays ).map( function ( d ) {
						var events = typeof self.events == "function" ? self.events() : self.events;
						return new Day( d, events.find( function ( e ) {
							return e.time.toDateString() == d.toDateString();
						} ) )
					} );
				}
			},
			weeks: {
				enumerable: true,
				get: function () {
					var firstWeek = new Date( this.year, this.month ).getWeek( 1970 );
					var lastWeek = firstWeek + 5;
					var result = new Array( 6 ).fill( false ).map( function () {
						return new Array()
					} );
					this.days.map( function ( d ) {
						var week = d.d.getWeek( 1970 );
						if ( week >= firstWeek && week <= lastWeek ) {
							result[ week - firstWeek ].push( d );
						};
					} );
					return result;
				}
			}
		} )
	};
	Calendar.prototype.nextMonth = function () {
		++this.page.month;
	};
	Calendar.prototype.prevMonth = function () {
		--this.page.month;
	};
	window.Calendar = Calendar;
} )();
