'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*!
 * ngTagsInput v2.0.1
 * http://mbenford.github.io/ngTagsInput
 *
 * Copyright (c) 2013-2014 Michael Benford
 * License: MIT
 *
 * Generated at 2014-04-13 21:25:38 -0300
 */
(function () {
  'use strict';

  var KEYS = {
    backspace: 8,
    tab: 9,
    enter: 13,
    escape: 27,
    space: 32,
    up: 38,
    down: 40,
    comma: 188
  };

  function SimplePubSub() {
    var events = {};
    return {
      on: function on(names, handler) {
        names.split(' ').forEach(function (name) {
          if (!events[name]) {
            events[name] = [];
          }
          events[name].push(handler);
        });
        return this;
      },
      trigger: function trigger(name, args) {
        angular.forEach(events[name], function (handler) {
          handler.call(null, args);
        });
        return this;
      }
    };
  }

  function makeObjectArray(array, key, key2) {
    array = array || [];
    if (array.length > 0 && !angular.isObject(array[0])) {
      array.forEach(function (item, index) {
        array[index] = _defineProperty({}, key, item);
        if (key2) array[index][key2] = item;
      });
    }
    return array;
  }

  function findInObjectArray(array, obj, key) {
    var item = null;
    var i = 0;
    var l = array.length;

    if (_.isFunction(key)) {
      var objVal = key(obj);
      if (!objVal) return null;
      for (; i < l; i++) {
        if (objVal === key(array[i])) {
          item = array[i];
          break;
        }
      }
    } else {
      for (; i < l; i++) {
        // I'm aware of the internationalization issues regarding toLowerCase()
        // but I couldn't come up with a better solution right now
        if (_.has(obj, key) && _.has(array[i], key) && (angular.toJson(array[i][key]) + '').toLowerCase() === (angular.toJson(obj[key]) + '').toLowerCase()) {
          item = array[i];
          break;
        }
      }
    }
    return item;
  }

  function replaceAll(str, substr, newSubstr) {
    var expression = substr.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    return str.replace(new RegExp(expression, 'gi'), newSubstr);
  }

  function matchTagsWithModel(tags, model, valueProperty) {
    //if(tags.length !== model.length) return false;
    if (!model || !tags || !tags.length) return false;

    if (!_.isArray(model)) {
      if (valueProperty) return angular.equals(model, tags[0][valueProperty]);
      return angular.equals(model, tags[0]);
    }

    return tags.some(function (tag, i) {
      tag = _.isObject(tag) && valueProperty ? tag[valueProperty] : tag;
      return angular.equals(tag, model[i]);
    });
  }

  function selectAll(input) {
    if (input.value) {
      input.setSelectionRange(0, input.value.length);
    }
  }

  var tagsInput = angular.module('cnTagsInput', []);

  /**
   * @ngdoc directive
   * @name tagsInput
   * @module cnTagsInput
   *
   * @description
   * Renders an input box with tag editing support.
   *
   * @param {string} ngModel Assignable angular expression to data-bind to.
   * @param {string=} [displayProperty=text] Property to be rendered as the tag label.
   * @param {string=} [valueProperty=value] Property to be used as the value when modelType is not array/object.
   * @param {number=} tabindex Tab order of the control.
   * @param {string=} [placeholder=Add a tag] Placeholder text for the control.
   * @param {number=} [minLength=3] Minimum length for a new tag.
   * @param {number=} maxLength Maximum length allowed for a new tag.
   * @param {boolean=} required Sets required validation error key.
   * @param {number=} minTags Sets minTags validation error key if the number of tags added is less than minTags.
   * @param {number=} maxTags Sets maxTags validation error key if the number of tags added is greater than maxTags.
   * @param {boolean=} [allowLeftoverText=false] Sets leftoverText validation error key if there is any leftover text in
   *                                             the input element when the directive loses focus.
   * @param {string=} [removeTagSymbol=×] Symbol character for the remove tag button.
   * @param {boolean=} [addOnEnter=true] Flag indicating that a new tag will be added on pressing the ENTER key.
   * @param {boolean=} [addOnSpace=false] Flag indicating that a new tag will be added on pressing the SPACE key.
   * @param {boolean=} [addOnComma=true] Flag indicating that a new tag will be added on pressing the COMMA key.
   * @param {boolean=} [addOnBlur=true] Flag indicating that a new tag will be added when the input field loses focus.
   * @param {boolean=} [replaceSpacesWithDashes=false] Flag indicating that spaces will be replaced with dashes.
   * @param {string=} [allowedTagsPattern=.+] Regular expression that determines whether a new tag is valid.
   * @param {boolean=} [enableEditingLastTag=false] Flag indicating that the last tag will be moved back into
   *                                                the new tag input box instead of being removed when the backspace key
   *                                                is pressed and the input box is empty.
   * @param {boolean=} [addFromAutocompleteOnly=false] Flag indicating that only tags coming from the autocomplete list will be allowed.
   *                                                   When this flag is true, addOnEnter, addOnComma, addOnSpace, addOnBlur and
   *                                                   allowLeftoverText values are ignored.
   * @param {expression} onBeforeTagAdded Expression to evaluate upon adding a new tag. The new tag is available as $tag.
   * @param {expression} onBeforeTagRemoved Expression to evaluate upon removing an existing tag. The removed tag is available as $tag.
   * @param {expression} onBeforeTagChanged Expression to evaluate upon adding or removing a tag. The affected tag is available as $tag. Prev value avialble as $prev.
   * @param {expression} onTagAdded Expression to evaluate upon adding a new tag. The new tag is available as $tag.
   * @param {expression} onTagRemoved Expression to evaluate upon removing an existing tag. The removed tag is available as $tag.
   * @param {expression} onTagChanged Expression to evaluate upon adding or removing a tag. The affected tag is available as $tag. Prev value avialble as $prev.
   * @param {expression} onInit Expression to evaluate upon initializing model value.
   * @param {string} modelType Defines ngModel type, if anything other than array, model is set to first tag in list
   * @param {string} arrayValueType Defines ngModel[] type, if anything other than object, value is set mapped from object's values
   * @param {boolean=} [hideTags=false] Flag indicating whether to hide tag list (for manually displaying tag list in other way)
   * @param {boolean=} [dropdownIcon=false] Flag to show icon on right side
   * @param {string=} [tagsStyle='tags'] Default tags style
   */
  tagsInput.directive('tagsInput', ["$timeout", "$document", "tagsInputConfig", "$sce", "$rootScope", function ($timeout, $document, tagsInputConfig, $sce, $rootScope) {
    function TagList(options, events) {
      var self = {},
          getTagText,
          setTagText,
          tagIsValid;

      //getTagText = function(tag) {
      //  if(!_.isObject(tag)) return tag;
      //  return tag[options.displayProperty];
      //};

      getTagText = options.getTagText = function (tag) {
        if (!_.isObject(tag)) return tag;
        return options.itemFormatter ? options.itemFormatter(tag) : tag[options.displayProperty];
      };

      setTagText = function setTagText(tag, text) {
        // only create tag object when not adding from auto-complete
        if (tag[options.displayProperty]) return;

        tag[options.displayProperty] = text;
        if (options.valueProperty && !_.has(tag, options.valueProperty)) {
          tag[options.valueProperty] = text;
        }
      };

      tagIsValid = function tagIsValid(tag) {
        var tagText = getTagText(tag) + '';

        return (!options.minLength || tagText.length >= options.minLength) && (!options.maxLength || tagText.length <= options.maxLength) && options.allowedTagsPattern.test(tagText) && !findInObjectArray(self.items, tag,
        //_.has(tag, options.valueProperty) ? options.valueProperty : getTagText
        options.valueProperty || getTagText);
      };

      self.items = [];

      self.addText = function (text) {
        var tag = {};
        setTagText(tag, text);
        self.add(tag);
      };

      self.add = function (tag) {
        if (tag.disabled) return;

        var tagText = getTagText(tag);

        if (tagText.trim) tagText = tagText.trim();

        if (options.replaceSpacesWithDashes) {
          tagText = tagText.replace(/\s/g, '-');
        }

        setTagText(tag, tagText);

        if (tagIsValid(tag)) {
          if (options.maxTags && self.items.length >= options.maxTags) {
            self.items.pop();
            events.trigger('tag-removed', { $tag: tag, $event: 'tag-removed' });
          }
          self.items.push(tag);
          events.trigger('tag-added', { $tag: tag, $event: 'tag-added' });
        } else {
          events.trigger('invalid-tag', { $tag: tag, $event: 'invalid-tag' });
        }

        return tag;
      };

      self.remove = function (index) {
        var tag = self.items.splice(index, 1)[0];
        events.trigger('tag-removed', { $tag: tag, $event: 'tag-removed' });
        return tag;
      };

      self.removeLast = function () {
        var tag,
            lastTagIndex = self.items.length - 1;

        if (options.enableEditingLastTag || self.selected) {
          self.selected = null;
          tag = self.remove(lastTagIndex);
        } else if (!self.selected) {
          self.selected = self.items[lastTagIndex];
        }

        return tag;
      };

      return self;
    }

    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        tags: '=ngModel',
        itemFormatter: '=',
        ngDisabled: '=',
        onBeforeTagAdded: '&',
        onBeforeTagRemoved: '&',
        onBeforeTagChanged: '&',
        onTagAdded: '&',
        onTagRemoved: '&',
        onTagChanged: '&',
        onInit: '&',
        newTag: '=?'
      },
      replace: false,
      transclude: true,
      templateUrl: 'cnTagsInput/tags-input.html',
      controller: ["$scope", "$attrs", "$element", function ($scope, $attrs, $element) {
        tagsInputConfig.load('tagsInput', $scope, $attrs, {
          placeholder: [String, ''],
          tabindex: [Number],
          removeTagSymbol: [String, String.fromCharCode(215)],
          replaceSpacesWithDashes: [Boolean, false],
          minLength: [Number, 2],
          maxLength: [Number],
          addOnEnter: [Boolean, true],
          addOnSpace: [Boolean, false],
          addOnComma: [Boolean, true],
          addOnBlur: [Boolean, false],
          allowedTagsPattern: [RegExp, /.+/],
          enableEditingLastTag: [Boolean, false],
          required: [Boolean, false],
          minTags: [Number],
          maxTags: [Number],
          displayProperty: [String, 'text'],
          valueProperty: [String],
          allowLeftoverText: [Boolean, false],
          addFromAutocompleteOnly: [Boolean, false],
          //tagClasses: [Object, null],
          tagClass: [String, ''],
          modelType: [String, 'array'],
          arrayValueType: [String, 'object'],
          hideTags: [Boolean, false],
          dropdownIcon: [Boolean, false],
          tagsStyle: [String, 'tags'],
          allowBulk: [Boolean, false],
          bulkDelimiter: [RegExp, /, ?|\n/],
          bulkPlaceholder: [String, 'Enter a list separated by commas or new lines'],
          showButton: [Boolean, false]
        });

        var options = $scope.options;

        if (!options.valueProperty && (!/object|array/.test(options.modelType) || options.arrayValueType !== 'object')) {
          options.valueProperty = 'value';
        }

        if ($scope.itemFormatter) options.itemFormatter = $scope.itemFormatter;

        if (options.tagsStyle === 'tags') {
          options.tagClass = options.tagClass || 'label-primary';
        }

        if (options.allowBulk && (options.modelType !== 'array' || options.maxTags === 1)) {
          options.allowBulk = false;
        }

        $scope.events = new SimplePubSub();
        $scope.tagList = new TagList(options, $scope.events);

        this.registerAutocomplete = function () {
          var input = options.input = $element.find('input.input');
          input.on('keydown', function (e) {
            $scope.events.trigger('input-keydown', e);
          });

          return {
            addTag: function addTag(tag) {
              return $scope.tagList.add(tag);
            },
            focusInput: function focusInput() {
              input[0].focus();
            },
            blurInput: function blurInput() {
              input[0].blur();
            },
            getTags: function getTags() {
              return $scope.tagList.items;
            },
            getOptions: function getOptions() {
              return options;
            },
            on: function on(name, handler) {
              $scope.events.on(name, handler);
              return this;
            },
            registerProcessBulk: function registerProcessBulk(fn) {
              $scope.processBulk = function () {
                fn($scope.bulkTags).then(function () {
                  $scope.showBulk = false;
                  $scope.bulkTags = '';
                });
              };
            }
          };
        };
      }],
      link: function link(scope, element, attrs, ngModelCtrl) {
        var hotkeys = [KEYS.enter, KEYS.comma, KEYS.space, KEYS.backspace],
            tagList = scope.tagList,
            events = scope.events,
            options = scope.options,
            input = element.find('input.input'),
            blurTimeout;

        if (attrs.inputId && !ngModelCtrl.$name) {
          ngModelCtrl.$name = attrs.inputId;
        }

        // before callbacks allow code to modify tag before it's added
        // after callback fired after ngModel has chance to update
        function beforeAndAfter(before, after) {
          return function () {
            var args = arguments;
            before.apply(this, args);
            $timeout(function () {
              after.apply(this, args);
            });
          };
        }

        events.on('tag-added', beforeAndAfter(scope.onBeforeTagAdded, scope.onTagAdded)).on('tag-removed', beforeAndAfter(scope.onBeforeTagRemoved, scope.onTagRemoved)).on('tag-changed', beforeAndAfter(scope.onBeforeTagChanged, scope.onTagChanged)).on('tag-init', scope.onInit).on('tag-added tag-removed', function (e) {
          if (!options.maxTags || options.maxTags > scope.tagList.items.length) {
            selectAll(options.input[0]);
          } else {
            scope.newTag.text = '';
          }
          if (options.modelType === 'array') {
            //if(options.arrayValueType === 'object') {
            if (!options.valueProperty) {
              scope.tags = scope.tagList.items;
            } else {
              scope.tags = _.pluck(scope.tagList.items, options.valueProperty);
            }
          } else {
            if (e.$event === 'tag-removed') {
              //ngModelCtrl.$setViewValue(undefined);
              scope.tags = undefined;
            } else {
              //if(options.modelType === 'object') {
              if (!options.valueProperty) {
                //ngModelCtrl.$setViewValue(e.$tag);
                scope.tags = e.$tag;
              } else {
                //ngModelCtrl.$setViewValue(e.$tag.value);
                scope.tags = _.has(e.$tag, options.valueProperty) ? e.$tag[options.valueProperty] : e.$tag[options.displayProperty];
              }
              //scope.tags = [e.$tag];
            }
          }
        }).on('invalid-tag', function () {
          scope.newTag.invalid = true;
        }).on('input-change', function () {
          tagList.selected = null;
          scope.newTag.invalid = null;
        }).on('input-focus', function () {
          ngModelCtrl.$setValidity('leftoverText', true);
        }).on('input-blur', function () {
          if (!options.addFromAutocompleteOnly) {
            if (options.addOnBlur && scope.newTag.text) {
              tagList.addText(scope.newTag.text);
            }

            ngModelCtrl.$setValidity('leftoverText', options.allowLeftoverText ? true : !scope.newTag.text);
          }

          // Reset newTag
          // TODO: maybe make this optional, we don't want to clear in all
          // TODO: cases, like on the filter inputs on list pages
          // scope.newTag.text = '';
          // scope.newTag.invalid = null;
        });

        scope.newTag = { text: '', invalid: null };

        scope.getDisplayText = scope.itemFormatter || function (tag) {
          return tag && ((tag[options.displayProperty] || 'undefined') + '').trim();
        };

        scope.getDisplayHtml = function (tag) {
          return $sce.trustAsHtml(scope.getDisplayText(tag));
        };

        scope.track = function (tag) {
          return tag[options.displayProperty];
        };

        scope.newTagChange = function () {
          events.trigger('input-change', scope.newTag.text);
        };

        scope.processBulk = scope.processBulk || function () {
          var tags = scope.bulkTags.split(options.bulkDelimiter);
          _.each(tags, function (text) {
            var tag = {};
            tag[options.displayProperty] = text;
            scope.tagList.add(tag);
          });
          scope.showBulk = false;
          scope.bulkTags = '';
        };

        var first = true;

        scope.triggerInit = function (value, prev) {
          var criteria = options.valueProperty ? _defineProperty({}, options.valueProperty, value) : value;
          if (!tagList.items.length || !_.find(tagList.items, criteria)) {
            events.trigger('tag-init', {
              $tag: value,
              $prev: prev,
              $event: 'tag-init',
              $setter: function $setter(val) {
                if (val && !_.isObject(val)) {
                  var _ref2;

                  tagList.items = [(_ref2 = {}, _defineProperty(_ref2, options.displayProperty, val), _defineProperty(_ref2, options.valueProperty, val), _ref2)];
                } else {
                  tagList.items = _.isArray(val) ? val : [val];
                }
                return tagList.items;
              }
            });
          }
        };

        scope.$watch('tags', function (value, prev) {
          var changed = !angular.equals(value, prev);
          var init = !changed && first;

          if (init) {
            scope.triggerInit(value, prev);
          }
          if (changed) {
            events.trigger('tag-changed', {
              $tag: value,
              $prev: prev,
              $event: 'tag-changed'
            });
          }

          if (options.modelType === 'array') {
            if (_.isArray(value)) {
              if (value.length) {
                var match = matchTagsWithModel(tagList.items, scope.tags, options.valueProperty);
                if (!match) {
                  scope.triggerInit(value, prev);
                }
                if (!match || tagList.items.length !== scope.tags.length) {
                  tagList.items = makeObjectArray(value, options.displayProperty, options.valueProperty);
                  if (options.arrayValueType !== 'object') {
                    scope.tags = _.pluck(tagList.items, options.valueProperty);

                    return;
                  }
                }
              } else {
                tagList.items = [];
                if (angular.isUndefined(prev)) return;
              }
            } else if (value === undefined) {
              tagList.items = [];
              scope.tags = [];
              return;
            }
          } else if (angular.isDefined(value)) {
            if (_.isArray(value)) {
              if (value.length) {
                //if(options.modelType === 'object') {
                if (!options.valueProperty) {
                  scope.tags = value[0];
                } else {
                  scope.tags = value[0][options.valueProperty];
                }

                return;
              } else {
                scope.tags = undefined;
              }
            } else {
              if (options.modelType === 'object') {
                if (value !== null) tagList.items = [value];
              } else {
                if (_.isObject(value)) {
                  tagList.items = [value];

                  var val = value[options.valueProperty];
                  if (!val) val = value[options.displayProperty];
                  scope.tags = val;

                  return;
                } else if (!_.isUndefined(value) && (!tagList.items.length || tagList.items[0][options.valueProperty] !== value)) {
                  scope.triggerInit(value, prev);
                }
                //else {
                //  var val = _.first(_.pluck(tagList.items, options.valueProperty));
                //  if(!val && val !== 0) val = _.first(_.pluck(tagList.items, options.displayProperty));
                //  if(val !== value) {
                //    var newTag = {};
                //    newTag[options.valueProperty] = value;
                //    tagList.items = [];
                //  }
                // todo: why were we overriding scope.tags? This will lead to recursion
                //scope.tags = val;
                //}
              }
            }
          } else if (!value && tagList.items.length) {
              tagList.items = [];
            }

          if (!init && changed) {
            ngModelCtrl.$setDirty();
          }

          // hack because schemaForm is incorrectly invalidating model sometimes
          ngModelCtrl.$setValidity('schemaForm', true);
          if (options.modelType === 'array') {
            ngModelCtrl.$setValidity('tv4-401', value && options.maxTags ? value.length <= options.maxTags : true);
            ngModelCtrl.$setValidity('tv4-302', value ? angular.isDefined(options.minTags) ? value.length >= options.minTags : true : false);
          } else {
            ngModelCtrl.$setValidity('tv4-302', !options.required || !angular.isUndefined(value));
          }

          first = false;
        }, true);

        input.on('keydown', function (e) {
          // This hack is needed because jqLite doesn't implement stopImmediatePropagation properly.
          // I've sent a PR to Angular addressing this issue and hopefully it'll be fixed soon.
          // https://github.com/angular/angular.js/pull/4833
          if (e.isImmediatePropagationStopped && e.isImmediatePropagationStopped()) {
            return;
          }

          var key = e.keyCode,
              isModifier = e.shiftKey || e.altKey || e.ctrlKey || e.metaKey,
              addKeys = {},
              shouldAdd,
              shouldRemove;

          if (isModifier || hotkeys.indexOf(key) === -1) {
            return;
          }

          addKeys[KEYS.enter] = options.addOnEnter;
          addKeys[KEYS.comma] = options.addOnComma;
          addKeys[KEYS.space] = options.addOnSpace;

          shouldAdd = !options.addFromAutocompleteOnly && addKeys[key];
          shouldRemove = !shouldAdd && key === KEYS.backspace && scope.newTag.text.length === 0;

          if (shouldAdd) {
            tagList.addText(scope.newTag.text);

            scope.$apply();
            e.preventDefault();
          } else if (shouldRemove) {
            var tag = tagList.removeLast();
            if (tag && options.enableEditingLastTag) {
              scope.newTag.text = tag[options.displayProperty];
            }

            scope.$apply();
            e.preventDefault();
          }
        }).on('focus', onFocus).on('blur', function (e) {
          blurTimeout = $timeout(function () {
            var activeElement = $document.prop('activeElement'),
                lostFocusToBrowserWindow = activeElement === input[0],
                lostFocusToChildElement = element[0].contains(activeElement);

            if (lostFocusToBrowserWindow || !lostFocusToChildElement) {
              scope.hasFocus = false;
              events.trigger('input-blur', e);
            }
          }, 150); // timeout so that click event triggers first
        });

        element.find('textarea').on('keydown', function (e) {
          if (!e.altKey && !e.ctrlKey && !e.metaKey && e.keyCode === KEYS.enter) {
            e.preventDefault();
            scope.processBulk();
          }
        });

        element.find('div').on('click', function (e) {
          if (!$(e.target).closest('.suggestion').length) {
            e.preventDefault();
            input[0].focus();
          }
        });

        function onFocus(e) {
          if (e) e.preventDefault();
          if (scope.ngDisabled) return;

          selectAll(e.target);

          if (blurTimeout) $timeout.cancel(blurTimeout);

          scope.hasFocus = true;
          events.trigger('input-focus', input.val());

          if (!/apply|digest/.test(scope.$root.$$phase)) scope.$apply();
        }
      }
    };
  }]);

  /**
   * @ngdoc directive
   * @name autoComplete
   * @module cnTagsInput
   *
   * @description
   * Provides autocomplete support for the tagsInput directive.
   *
   * @param {expression} source Expression to evaluate upon changing the input content. The input value is available as
   *                            $query. The result of the expression must be a promise that eventually resolves to an
   *                            array of strings.
   * @param {number=} [debounceDelay=100] Amount of time, in milliseconds, to wait before evaluating the expression in
   *                                      the source option after the last keystroke.
   * @param {number=} [minLength=3] Minimum number of characters that must be entered before evaluating the expression
   *                                 in the source option.
   * @param {boolean=} [highlightMatchedText=true] Flag indicating that the matched text will be highlighted in the
   *                                               suggestions list.
   * @param {number=} [maxResultsToShow=10] Maximum number of results to be displayed at a time.
   */
  tagsInput.directive('autoComplete', ["$document", "$timeout", "$filter", "$sce", "tagsInputConfig", "$parse", 'Api', function ($document, $timeout, $filter, $sce, tagsInputConfig, $parse, Api) {
    function SuggestionList(scope, options) {
      var self = {},
          debouncedLoadId,
          getDifference,
          lastPromise,
          groupList,
          splitListItems,
          formatItemText,
          mapIndexes;

      groupList = function groupList(list, groupBy) {
        var filtered = {},
            map = [],
            index = 0,
            keys;

        // loop through each item in the list
        _.each(list, function (item) {
          keys = $parse(groupBy)(item);
          if (!_.isArray(keys)) keys = [keys];
          _.each(keys, function (key) {
            if (!filtered[key]) {
              filtered[key] = [];
            }
            filtered[key].push(item);
          });
        });

        _.each(filtered, function (group) {
          group.indexes = [];
          _.each(group, function (item) {
            group.indexes.push(index++);
            map.push(item);
          });
        });

        return {
          groups: filtered,
          map: map
        };
      };

      formatItemText = function formatItemText(item, formatter) {
        if (formatter) {
          if (!_.isArray(formatter)) {
            formatter = [formatter, {}];
          }
          return $parse(formatter[0])((formatter[1].val = item) && formatter[1]);
        }

        return item;
      };

      splitListItems = function splitListItems(items) {
        var keys = [];

        function addItem(key, item, group, prop) {
          var text = _.isObject(item) ? item[prop || options.tagsInput.displayProperty] : item,
              toAdd = {
            text: formatItemText(text, group.formatter),
            value: text,
            key: key,
            childKey: prop /*,
                           tagClass: options.tagClasses && options.tagClasses[key] || options.tagClass*/
          };

          if (!_.find(group.items, toAdd)) {
            group.items.push(toAdd);
          }
        }

        _.each(scope.searchKeys, function (group) {
          var key = group.key;
          group.items = [];

          _.each(items, function (item) {
            if (item[key]) {
              if (_.isArray(item[key])) {
                _.each(item[key], function (child) {
                  addItem(key, child, group, group.childKey);
                });
              } else {
                addItem(key, item[key], group, group.childKey);
              }
            }
          });
          keys.push(group);
        });

        return keys;
      };

      mapIndexes = function mapIndexes(items) {
        var map = [],
            index = 0;

        _.each(items, function (group) {
          group.indexes = [];
          _.each(group.items, function (item) {
            group.indexes.push(index++);
            map.push(item);
          });
        });

        return map;
      };

      getDifference = function getDifference(array1, array2) {
        if (!array2.length) {
          return array1.filter(function (item) {
            return item[options.tagsInput.displayProperty] !== '';
          });
        }
        return array1.filter(function (item) {
          return !findInObjectArray(array2, item,
          //_.has(item, options.tagsInput.valueProperty) ? options.tagsInput.valueProperty : options.tagsInput.getTagText
          options.tagsInput.valueProperty || options.tagsInput.getTagText);
        });
      };

      self.reset = function () {
        lastPromise = null;

        self.items = [];
        self.visible = false;
        self.index = -1;
        self.selected = null;
        self.query = null;

        $timeout.cancel(debouncedLoadId);
      };

      self.show = function () {
        self.selected = null;
        self.visible = true;
        self.select(0);
      };

      self.load = function (query, tags) {
        if (query.length < options.minLength) {
          self.reset();
          return;
        }

        var promise,

        //filterBy = {},
        filterBy = query,
            groups,
            processItems = function processItems(items) {
          if (promise && promise !== lastPromise) {
            return;
          }

          if (scope.searchKeys) {
            scope.isGroups = true;
            //filterBy = query;
            items = splitListItems(items);
          }
          if (_.isObject(items) && !_.isArray(items)) {
            scope.isGroups = true;
            items = _.map(items, function (list, group) {
              return {
                items: list,
                label: group
              };
            });
          }
          if (scope.isGroups) {
            _.each(items, function (group) {
              group.items = getDifference(group.items, tags);
              if (query) group.items = $filter('cnFilter')(group.items, filterBy);

              group.items = group.items.slice(0, options.maxResultsToShow);
            });
            self.itemMap = mapIndexes(items);
          } else {
            //filterBy[options.tagsInput.displayProperty] = query;
            items = makeObjectArray(items.data || items, options.tagsInput.displayProperty);
            items = getDifference(items, tags);
            if (query && !options.skipFiltering) {
              items = $filter('cnFilter')(items, filterBy);
            }

            items = items.slice(0, options.maxResultsToShow);

            if (options.groupBy) {
              groups = groupList(items, options.groupBy);
              items = groups.groups;
              self.itemMap = groups.map;
            }
          }

          self.items = items;

          if (!_.isEmpty(self.items)) {
            self.show();
          } else {
            self.reset();
          }
        };

        $timeout.cancel(debouncedLoadId);
        self.query = query;
        debouncedLoadId = $timeout(function () {
          var source = scope.source({ $query: query });
          if (_.isArray(source)) {
            $timeout(function () {
              processItems(source || []);
            });
          } else {
            if (!options.minLength) {
              source.then(function (results) {
                scope.source = function () {
                  return results;
                };
                processItems(results || []);
              });
            } else {
              promise = source;
              lastPromise = promise;
              promise.then(processItems);
            }
          }
        }, options.minLength ? options.debounceDelay : 0, false);
      };
      self.selectNext = function () {
        self.select(++self.index);
      };
      self.selectPrior = function () {
        self.select(--self.index);
      };
      self.select = function (index) {
        var list = self.itemMap || self.items;
        if (index < 0) {
          index = list.length - 1;
        } else if (index >= list.length) {
          index = 0;
        }
        self.index = index;
        if (self.itemMap) {
          self.selected = self.itemMap[index];
        } else {
          self.selected = self.items[index];
        }
      };

      //self.reset();

      return self;
    }

    function encodeHTML(value) {
      return value ? value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
    }

    return {
      restrict: 'E',
      require: '^tagsInput',
      scope: {
        source: '&',
        searchKeys: '=?'
      },
      templateUrl: function templateUrl(elem, attrs) {
        return attrs.customTemplateUrl || 'cnTagsInput/auto-complete.html';
      },
      link: function link(scope, element, attrs, tagsInputCtrl) {
        var hotkeys = [KEYS.enter, KEYS.tab, KEYS.escape, KEYS.up, KEYS.down],
            suggestionList,
            tagsInput,
            options,
            getItemText,
            documentClick;

        tagsInputConfig.load('autoComplete', scope, attrs, {
          debounceDelay: [Number, 250],
          minLength: [Number, 3],
          highlightMatchedText: [Boolean, true],
          maxResultsToShow: [Number, 75],
          groupBy: [String, ''],
          skipFiltering: [Boolean, false]
        });

        options = scope.options;

        tagsInput = tagsInputCtrl.registerAutocomplete();
        options.tagsInput = tagsInput.getOptions();

        if (options.minLength === 0 /* && _.isArray(scope.source())*/) {
            options.tagsInput.dropdownIcon = true;
            if (options.tagsInput.maxTags === 1) {
              options.tagsInput.dropdownStyle = 'caret';
            } else {
              options.tagsInput.dropdownStyle = 'fa fa-plus';
            }
          } else {
          options.tagsInput.dropdownStyle = 'fa fa-search';
        }

        suggestionList = new SuggestionList(scope, options);

        getItemText = options.tagsInput.itemFormatter || function (item) {
          return String(item[options.tagsInput.displayProperty]);
        };

        scope.suggestionList = suggestionList;

        scope.addSuggestion = function (e) {
          e.preventDefault();

          //selectAll(e.target);

          var added = false;

          if (suggestionList.selected) {
            tagsInput.addTag(angular.copy(suggestionList.selected));

            if (!options.tagsInput.maxTags || tagsInput.getTags().length < options.tagsInput.maxTags) {
              var i = suggestionList.items.indexOf(suggestionList.selected);
              suggestionList.items.splice(i, 1);
              suggestionList.select(i);
              tagsInput.focusInput();
            } else {
              suggestionList.reset();
              tagsInput.blurInput();
            }

            added = true;
          }
          return added;
        };

        scope.highlight = function (item, key) {
          var text = getItemText(item, key);
          //text = encodeHTML(text);
          if (suggestionList.query && options.highlightMatchedText) {
            //text = replaceAll(text, encodeHTML(suggestionList.query), '<b>$&</b>');
            text = replaceAll(text, suggestionList.query, '<b>$&</b>');
          }
          return $sce.trustAsHtml('<a>' + text + '</a>');
        };

        scope.track = function (item, key) {
          return getItemText(item, key);
        };

        tagsInput.registerProcessBulk(function (bulkTags) {
          var tags = bulkTags.split(options.tagsInput.bulkDelimiter);

          var addTags = function addTags(i) {
            return function (data) {
              _.times(i, function (i) {
                if (data[i]) tagsInput.addTag(data[i]);
              });
            };
          };

          // in case a query is involved...doesn't hurt to use even if not
          return Api.batch(function () {
            for (var i = 0, l = tags.length; i < l; i++) {
              if (options.tagsInput.maxTags && tagsInput.getTags().length >= options.tagsInput.maxTags) break;
              var tag = tags[i];
              var times = 1;
              var multiple = tags[i].match(/(.*) ?\((\d+)\)$/);

              if (multiple) {
                tag = multiple[1];
                times = parseInt(multiple[2]);
              }

              var results = scope.source({ $query: tag });

              if (_.isArray(results)) {
                if (results.length) {
                  if (!options.skipFiltering) {
                    //var filterBy = {};
                    var filterBy = tag;
                    //filterBy[options.tagsInput.displayProperty] = tags[i];
                    results = $filter('cnFilter')(results, filterBy);
                  }
                  addTags(times)(results);
                } else if (!options.tagsInput.addFromAutocompleteOnly) {
                  var _tagsInput$addTag;

                  tagsInput.addTag((_tagsInput$addTag = {}, _defineProperty(_tagsInput$addTag, options.tagsInput.displayProperty, tag), _defineProperty(_tagsInput$addTag, options.tagsInput.valueProperty, tag), _tagsInput$addTag));
                }
              } else if (results.then) {
                results.then(addTags(times));
              }
            }
          });
        });

        tagsInput.on('input-change', function (value) {
          if (value || !options.minLength) {
            suggestionList.load(value, tagsInput.getTags());
          } else {
            suggestionList.reset();
          }
        }).on('input-focus', function (value) {
          if (!suggestionList.visible && !options.minLength) {
            suggestionList.load(value, tagsInput.getTags());
          }
        }).on('input-keydown', function (e) {
          var key, handled;

          if (hotkeys.indexOf(e.keyCode) === -1) {
            return;
          }

          // This hack is needed because jqLite doesn't implement stopImmediatePropagation properly.
          // I've sent a PR to Angular addressing this issue and hopefully it'll be fixed soon.
          // https://github.com/angular/angular.js/pull/4833
          var immediatePropagationStopped = false;
          e.stopImmediatePropagation = function () {
            immediatePropagationStopped = true;
            e.stopPropagation();
          };
          e.isImmediatePropagationStopped = function () {
            return immediatePropagationStopped;
          };

          if (suggestionList.visible) {
            key = e.keyCode;
            handled = false;

            if (key === KEYS.down) {
              suggestionList.selectNext();
              handled = true;
            } else if (key === KEYS.up) {
              suggestionList.selectPrior();
              handled = true;
            } else if (key === KEYS.escape) {
              suggestionList.reset();
              handled = true;
            } else if (key === KEYS.enter) {
              handled = scope.addSuggestion(e);
            }
            // adding seems to prevent tab action, need to figure out a way around that before uncommenting
            //else if(key === KEYS.tab && options.tagsInput.addOnBlur) {
            //  scope.addSuggestion(e);
            //}

            if (handled) {
              e.preventDefault();
              e.stopImmediatePropagation();
              scope.$apply();
            }
          }
        }).on('input-blur', function (e) {
          //changed to use document click or focus, as this fires too soon and cancels
          //automcomplete click events
          //suggestionList.reset();
        });

        documentClick = function documentClick(e) {
          if (e.isDefaultPrevented()) return;

          if (suggestionList.visible) {
            // if autocomplete option was selected, or click/focus triggered outside of directive
            if (($(e.target).closest('.suggestion').length || !$(e.target).closest(element[0]).length) && !(e.type === 'blur' && !/^(input|select|textarea|button|a)$/i.test(e.target.tagName))) {
              suggestionList.reset();
              if (!/apply|digest/.test(scope.$root.$$phase)) scope.$apply();
            }
          }
        };

        $document.on('click blur', documentClick);

        scope.$on('$destroy', function () {
          $document.off('click blur', documentClick);
        });
      }
    };
  }]);

  /**
   * @ngdoc directive
   * @name tiTranscludeAppend
   * @module cnTagsInput
   *
   * @description
   * Re-creates the old behavior of ng-transclude. Used internally by tagsInput directive.
   */
  tagsInput.directive('tiTranscludeAppend', function () {
    return function (scope, element, attrs, ctrl, transcludeFn) {
      transcludeFn(function (clone) {
        element.append(clone);
      });
    };
  });

  /**
   * @ngdoc directive
   * @name tiAutosize
   * @module cnTagsInput
   *
   * @description
   * Automatically sets the input's width so its content is always visible. Used internally by tagsInput directive.
   */
  tagsInput.directive('tiAutosize', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function link(scope, element, attrs, ctrl) {
        var THRESHOLD = 3,
            span,
            resize;

        span = angular.element('<span class="input"></span>');
        span.css('display', 'none').css('visibility', 'hidden').css('width', 'auto').css('white-space', 'pre');

        element.parent().append(span);

        resize = function resize(originalValue) {
          var value = originalValue,
              width;

          if (angular.isString(value) && value.length === 0) {
            value = attrs.placeholder;
          }

          if (value) {
            span.text(value);
            span.css('display', '');
            width = span.prop('offsetWidth');
            span.css('display', 'none');
          }

          element.css('width', width ? width + THRESHOLD + 'px' : '');

          return originalValue;
        };

        ctrl.$parsers.unshift(resize);
        ctrl.$formatters.unshift(resize);

        attrs.$observe('placeholder', function (value) {
          if (!ctrl.$modelValue) {
            resize(value);
          }
        });
      }
    };
  });

  /**
   * @ngdoc service
   * @name tagsInputConfig
   * @module cnTagsInput
   *
   * @description
   * Sets global configuration settings for both tagsInput and autoComplete directives. It's also used internally to parse and
   * initialize options from HTML attributes.
   */
  tagsInput.provider('tagsInputConfig', function () {
    var globalDefaults = {},
        interpolationStatus = {};

    /**
     * @ngdoc method
     * @name setDefaults
     * @description Sets the default configuration option for a directive.
     * @methodOf tagsInputConfig
     *
     * @param {string} directive Name of the directive to be configured. Must be either 'tagsInput' or 'autoComplete'.
     * @param {object} defaults Object containing options and their values.
     *
     * @returns {object} The service itself for chaining purposes.
     */
    this.setDefaults = function (directive, defaults) {
      globalDefaults[directive] = defaults;
      return this;
    };

    /***
     * @ngdoc method
     * @name setActiveInterpolation
     * @description Sets active interpolation for a set of options.
     * @methodOf tagsInputConfig
     *
     * @param {string} directive Name of the directive to be configured. Must be either 'tagsInput' or 'autoComplete'.
     * @param {object} options Object containing which options should have interpolation turned on at all times.
     *
     * @returns {object} The service itself for chaining purposes.
     */
    this.setActiveInterpolation = function (directive, options) {
      interpolationStatus[directive] = options;
      return this;
    };

    this.$get = ["$interpolate", function ($interpolate) {
      var converters = {};
      converters[String] = function (value) {
        return value;
      };
      converters[Number] = function (value) {
        return parseInt(value, 10);
      };
      converters[Boolean] = function (value) {
        return value.toLowerCase() === 'true';
      };
      converters[RegExp] = function (value) {
        return new RegExp(value);
      };
      converters[Object] = function (value) {
        return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' ? value : Object(value);
      };

      return {
        load: function load(directive, scope, attrs, options) {
          scope.options = {};
          scope.attrs = attrs;
          scope.uid = _.uniqueId();

          angular.forEach(options, function (value, key) {
            var type, localDefault, converter, getDefault, updateValue;

            type = value[0];
            localDefault = value[1];
            converter = converters[type];

            getDefault = function getDefault() {
              var globalValue = globalDefaults[directive] && globalDefaults[directive][key];
              return angular.isDefined(globalValue) ? globalValue : localDefault;
            };

            updateValue = function updateValue(value) {
              scope.options[key] = value ? converter(value) : getDefault();
            };

            if (scope[key]) {
              updateValue(scope[key]);
            } else if (interpolationStatus[directive] && interpolationStatus[directive][key]) {
              attrs.$observe(key, function (value) {
                updateValue(value);
              });
            } else {
              updateValue(attrs[key] && $interpolate(attrs[key])(scope.$parent));
            }
          });
        }
      };
    }];
  });

  /* HTML templates */
  tagsInput.run(["$templateCache", function ($templateCache) {
    $templateCache.put('cnTagsInput/tags-input.html', "\
        <ul class=\"list-group cn-autocomplete-list\" \
            ng-if=\"options.tagsStyle === 'list' && tagList.items.length && !options.hideTags\">\
          <li class=\"list-group-item {{options.tagClass}}\" \
              ng-repeat=\"tag in tagList.items\" \
              ng-class=\"{ selected: tag == tagList.selected }\">\
            <button ng-if=\"!ngDisabled\" \
                    ng-click=\"tagList.remove($index)\" \
                    type=\"button\" class=\"close pull-right\">\
              <span>&times;</span>\
            </button>\
            <span class=\"tag-item\" ng-bind-html=\"getDisplayHtml(tag)\"/> \
          </li>\
        </ul>\
        <div class=\"host clearfix\"\
             ng-hide=\"showBulk\"\
             ti-transclude-append=\"\">\
          <!-- hack to avoid browser's autocomplete -->\
          <input class=\"offscreen\" \
                 id=\"fake-{{attrs.id && attrs.id}}-input\" \
                 name=\"fake-{{attrs.id && attrs.id}}-input\">\
          <!-- end hack to avoid browser's autocomplete -->\
          <div class=\"input form-control tags\" \
               ng-class=\"{focused: hasFocus}\" \
               ng-disabled=\"ngDisabled\">\
            <input class=\"input\" \
                   ng-disabled=\"ngDisabled\"\
                   id=\"{{attrs.inputId || attrs.id && attrs.id + '-input-' + uid}}\"\
                   name=\"{{attrs.inputId || attrs.id && attrs.id + '-input-' + uid}}\"\
                   placeholder=\"{{options.placeholder}}\" \
                   tabindex=\"{{options.tabindex}}\" \
                   ng-model=\"newTag.text\" \
                   ng-model-options=\"{updateOn: 'default'}\" \
                   ng-change=\"newTagChange()\" \
                   ng-trim=\"false\" \
                   ng-class=\"{\
                      'invalid-tag': newTag.invalid,\
                      'hide-below': options.maxTags === 1 && tagList.items.length\
                   }\" \
                   ti-autosize=\"\"\
                   autocomplete=\"off\">\
            <span class=\"tag-item label {{options.tagClass}} label-block\"\
                  ng-if=\"options.tagsStyle !== 'list' && !options.hideTags && options.maxTags === 1 && tagList.items.length\"\
                  title=\"{{getDisplayText(tagList.items[0])}}\">\
              <span ng-bind-html=\"getDisplayHtml(tagList.items[0])\"/> \
              <a class=\"remove-button\" \
                 ng-if=\"!ngDisabled && !options.dropdownIcon\"\
                 ng-click=\"tagList.remove()\">\
                <span>&times;</span>\
              </a>\
            </span>\
            <ul class=\"tag-list\" \
                ng-if=\"options.tagsStyle !== 'list' && !options.hideTags && options.maxTags !== 1\">\
              <li class=\"tag-item label {{options.tagClass}}\" \
                  ng-repeat=\"tag in tagList.items\" \
                  ng-class=\"{ selected: tag == tagList.selected }\">\
                <span ng-bind-html=\"getDisplayHtml(tag)\"/> \
                <a class=\"remove-button\" \
                   ng-if=\"!ngDisabled\"\
                   ng-click=\"tagList.remove($index)\">\
                  <span>&times;</span>\
                </a>\
              </li>\
            </ul>\
            <button ng-if=\"options.showButton && options.dropdownIcon\"\
                    class=\"btn form-control-icon\" ng-disabled=\"ngDisabled\" tabindex=\"-1\">\
              <i class=\"{{options.dropdownStyle}}\"></i>\
            </button>\
          </div>\
        </div>\
        <p class=\"help-block\" ng-show=\"options.allowBulk && !showBulk\"><a ng-click=\"showBulk = true\">Batch mode</a></p>\
        <div ng-show=\"showBulk\" class=\"clearfix\">\
          <textarea class=\"form-control\" ng-model=\"bulkTags\" placeholder=\"{{options.bulkPlaceholder}}\"></textarea>\
          <p class=\"help-block\">\
            Press \"Enter\" to submit, or return to <a ng-show=\"options.allowBulk\" ng-click=\"showBulk = false\">browse mode</a>\
          </p>\
        </div>");

    $templateCache.put('cnTagsInput/auto-complete.html', "<div ng-if=\"!suggestionList.items.length && !options.groupBy\" \
             ng-class=\"{open: suggestionList.visible}\">\
          <ul class=\"autocomplete dropdown-menu\">\
            <li class=\"dropdown-header\">No items...</li>\
          </ul>\
        </div>\
        <div ng-if=\"suggestionList.items.length && isGroups\" \
             ng-class=\"{open: suggestionList.visible}\">\
          <ul class=\"autocomplete dropdown-menu\">\
            <li ng-repeat-start=\"group in suggestionList.items\"></li>\
            <li class=\"dropdown-header\" ng-show=\"group.items.length\">{{group.label | titleCase}}</li>\
            <li ng-repeat=\"item in group.items\" \
                class=\"suggestion\" \
                ng-class=\"{selected: item == suggestionList.selected, disabled: item.disabled}\" \
                ng-click=\"addSuggestion($event)\" \
                ng-mouseenter=\"suggestionList.select(group.indexes[$index])\" \
                ng-bind-html=\"highlight(item, group.label)\">\
            </li>\
            <li class=\"divider\" ng-show=\"!$last && $parent.suggestionList.items[$index+1].items.length\"></li>\
            <li ng-repeat-end></li>\
          </ul>\
        </div>\
        <div ng-if=\"suggestionList.items.length && !isGroups && !options.groupBy\" \
             ng-class=\"{open: suggestionList.visible}\">\
          <ul class=\"autocomplete dropdown-menu\">\
            <li ng-repeat=\"item in suggestionList.items\" \
                class=\"suggestion\" \
                ng-class=\"{selected: item == suggestionList.selected, disabled: item.disabled}\" \
                ng-click=\"addSuggestion($event)\" \
                ng-mouseenter=\"suggestionList.select($index)\" \
                ng-bind-html=\"highlight(item)\">\
            </li>\
          </ul>\
        </div>\
        <div ng-if=\"!isGroups && options.groupBy\" \
             ng-class=\"{open: suggestionList.visible}\">\
          <ul class=\"autocomplete dropdown-menu\">\
            <li ng-repeat-start=\"(group, items) in suggestionList.items\"></li>\
            <li class=\"dropdown-header\" ng-show=\"items.length\">{{group | titleCase}}</li>\
            <li ng-repeat=\"item in items\" \
                class=\"suggestion\" \
                ng-class=\"{selected: item == suggestionList.selected, disabled: item.disabled}\" \
                ng-click=\"addSuggestion($event)\" \
                ng-mouseenter=\"suggestionList.select(suggestionList.items[group].indexes[$index])\" \
                ng-bind-html=\"highlight(item)\">\
            </li>\
            <li class=\"divider\" ng-show=\"!$last && items.length\"></li>\
            <li ng-repeat-end></li>\
          </ul>\
        </div>");
  }]);
})();