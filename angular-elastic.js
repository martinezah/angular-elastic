angular.module('angular-elastic', []).service('$elastic', ['esFactory', '$q', function(esFactory, $q) {

    var $elastic = {
        _state: {
            url: 'http://localhost:9200',
            size: 10,
            filters: {},
        }
    };

    $elastic.index = function(index) {
        if (index) {
            this._state.index = index;
            return this;
        }
        return this._state.index;
    };

    $elastic.type = function(type) {
        if (type) {
            this._state.type = type;
            return this;
        }
        return this._state.type;
    };

    $elastic.size = function(size) {
        if (size || size === 0) {
            this._state.size = size;
            return this;
        }
        return this._state.size;
    };

    $elastic.clearFilters = function() {
        this._state.filters = {};
        return this;
    };

    $elastic.addFilter = function(kk, vv) {
        this._state.filters[kk] = vv;
        return this;
    };

    $elastic.removeFilter = function(kk) {
        delete this._state.filters[kk];
        return this;
    };

    $elastic._format_query = function() {
        var body = {
            query: { 'match_all': { } }
        };
        var query = { }
        var has_filters = false;
        for(var prop in this._state.filters) {
            if (this._state.filters.hasOwnProperty(prop)) {
                query[prop] = this._state.filters[prop];
                has_filters = true;
            }
        }
        if (has_filters) {
            body.query = query;
        }
        return body;
    };

    $elastic.search = function() {
        var deferred = $q.defer();
        if (!this._state.client) {
            this.connect();
        }
        this._state.client.search({
            index: this._state.index,
            type: this._state.type,
            size: this._state.size,
            body: this._format_query()
        }).then(function success(resp) {
            $elastic._state.results = resp;
            $elastic._state.error = null;
            deferred.resolve(resp);
        }, function error(resp) {
            $elastic._state.results = null;
            $elastic._state.error = resp;
            deferred.reject(resp);
        });
        return deferred.promise;
    };

    $elastic.connect = function(url) {
        if (url) {
            this._state.url = url;
        }
        this._state.client = esFactory({ host: this._state.url });
        return this;
    };

    return $elastic;

}]);
