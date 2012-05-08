/* ********************************************************************************

   INSTRUCTIONS for USE

   1. call LIB.init(paths) where 'paths' is an object of the form
      { "[@metric]" : "[path to file (in same domain)]",
        "[@metric]" : "[path to file (in same domain)]"
      }
      The '@metric' value must match the value of the '@metric' in the source.

   2. Listen for the 'LIB_ready' event which will be triggered by LIB.init().

   3. Call LIB.getNextDay([@metric]) for each data source.
      The first entry in that data source will be returned.
      Subsequent calls will return the next entry until there are no more at which
         point, getNextDay() will return undefined (or null if an error occured).

   4. Call LIB.reset() before reading the data without reinitiallizing LIB.

** ******************************************************************************* */

(function($) {

	if (!window.console) {
		window.console = {
			error: function() { return false; },
			log: function() { return false; },
		};
	}

	var Lib = function() {

		var lib_data = {};
		var currentIndecies = {};


		/**
		 *
		 * @param data_sources a hash of the paths to the sources of data you desire. the key is what you will use to refer to the data from that resource. It MUST match the "@metric" value from the data source.
		 * @return true if success, false if an error
		 */
		this.init = function(data_sources) {

			var num_sources_to_retrieve = 0;
			var num_sources_handled = 0;
			try {
				for (src in data_sources) {
					num_sources_to_retrieve++;
					$.getJSON(data_sources[src], function(received_data) {
						try {
							lib_data[received_data['@metric']] = received_data;
							currentIndecies[received_data['@metric']] = 0;
						} catch(error) {
							console.error("Error parsing JSON data: ", error);
							return false;
						}
						return true;
					})
					.error(function(jqXHR, textStatus, errorThrown) {
						console.error("Error when requesting data source: ", src, " - ", errorThrown);
						return false;
					})
					.complete(function() {
						num_sources_handled++;
						if (num_sources_to_retrieve === num_sources_handled) {
							$(document).trigger('LIB_ready');
						}
					});
				}
			} catch(error) {
				console.error("Error with param passed to LIB.init()");
				return false;
			}
		};

		/**
		 *
		 */
		this.reset = function() {
			for (key in currentIndecies) {
				currentIndecies[key] = 0;
			}
		}

		/**
		 *
		 * @param src the data source which was a key passed to the 'init' method
		 * @return an object of the data indicated, undefined if reached the end of data, null if there was an error
		 */
		this.getNextDay = function(src) {
			try {
				var day_data = lib_data[src]['day'][currentIndecies[src]];
				currentIndecies[src]++;
				return day_data;
			} catch(error) {
				console.error("Error getting the next day's data object: ", src, " - index: ", currentIndecies[src], " -- ", error);
				return null;
			}
		};

	}; // end Lib

	/*
	 *
	 * @param date_string a string which Date will recognise
	 * @return Date string formatted in the current locale, null if error
	 */
	Lib.prototype.formatDate = function(date_string) {
		try {
			var date_formatted = new Date(date_string).toLocaleDateString();
		} catch(e) {
			return null;
		}
		return date_formatted;
	};


	window.LIB = window.LIB || new Lib;

})(jQuery);
