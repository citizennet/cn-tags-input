/*!
 * ngTagsInput v2.0.1
 * http://mbenford.github.io/ngTagsInput
 *
 * Copyright (c) 2013-2014 Michael Benford
 * License: MIT
 *
 * Generated at 2014-04-13 21:25:38 -0300
 */
(function() {
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
      on: function(names, handler) {
        names.split(' ').forEach(function(name) {
          if(!events[name]) {
            events[name] = [];
          }
          events[name].push(handler);
        });
        return this;
      },
      trigger: function(name, args) {
        angular.forEach(events[name], function(handler) {
          handler.call(null, args);
        });
        return this;
      }
    };
  }

  function makeObjectArray(array, key, key2) {
    array = array || [];
    if(array.length > 0 && !angular.isObject(array[0])) {
      array.forEach(function(item, index) {
        array[index] = {};
        array[index][key] = item;
        if(key2) array[index][key2] = item;
      });
    }
    return array;
  }

  function findInObjectArray(array, obj, key) {
    var item = null;
    var i = 0;
    var l = array.length;

    if(_.isFunction(key)) {
      var objVal = key(obj);
      if(!objVal) return null;
      for(; i < l; i++) {
        if(objVal === key(array[i])) {
          item = array[i];
          break;
        }
      }
    }
    else {
      for(; i < l; i++) {
        // I'm aware of the internationalization issues regarding toLowerCase()
        // but I couldn't come up with a better solution right now
        if(_.has(obj, key) &&
            _.has(array[i], key) &&
            angular.toJson(array[i][key]).toLowerCase() === angular.toJson(obj[key]).toLowerCase()) {
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
    var match = true, i = 0, l = tags.length;
    for(; i < l; i++) {
      if(!angular.equals(tags[i][valueProperty], model[i])) {
        match = false;
        break;
      }
    }
    return match;
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
   * @param {boolean=} [dropdown=false] Flag to show icon on right side
   * @param {string=} [tagsStyle='tags'] Default tags style
   */
  tagsInput.directive('tagsInput', [
    "$timeout", "$document", "tagsInputConfig",
    function($timeout, $document, tagsInputConfig) {
      function TagList(options, events) {
        var self = {}, getTagText, setTagText, tagIsValid;

        //getTagText = function(tag) {
        //  if(!_.isObject(tag)) return tag;
        //  return tag[options.displayProperty];
        //};

        getTagText = options.getTagText = function(tag) {
          if(!_.isObject(tag)) return tag;
          return options.itemFormatter ? options.itemFormatter(tag) : tag[options.displayProperty];
        };

        setTagText = function(tag, text) {
          // only create tag object when not adding from auto-complete
          if(tag[options.displayProperty]) return;

          tag[options.displayProperty] = text;
          if(!_.has(tag, options.valueProperty)) {
            tag[options.valueProperty] = text;
          }
        };

        tagIsValid = function(tag) {
          var tagText = getTagText(tag) + '';

          return (!options.minLength || tagText.length >= options.minLength) &&
                 (!options.maxLength || tagText.length <= options.maxLength) &&
                 options.allowedTagsPattern.test(tagText) &&
                 !findInObjectArray(
                     self.items,
                     tag,
                     _.has(tag, options.valueProperty) ? options.valueProperty : getTagText
                 );
        };

        self.items = [];

        self.addText = function(text) {
          var tag = {};
          setTagText(tag, text);
          return self.add(tag);
        };

        self.add = function(tag) {
          if(tag.disabled) return;

          var tagText = getTagText(tag);

          if(tagText.trim) tagText = tagText.trim();

          if(options.replaceSpacesWithDashes) {
            tagText = tagText.replace(/\s/g, '-');
          }

          setTagText(tag, tagText);

          //console.log('tagIsValid(tag):', tagIsValid(tag));
          if(tagIsValid(tag)) {
            //console.log('tag:', tag, options.maxTags, self.items.length >= options.maxTags);
            if(options.maxTags && self.items.length >= options.maxTags) {
              self.items.pop();
              events.trigger('tag-removed', {$tag: tag, $event: 'tag-removed'});
            }
            self.items.push(tag);
            events.trigger('tag-added', {$tag: tag, $event: 'tag-added'});
          }
          else {
            events.trigger('invalid-tag', {$tag: tag, $event: 'invalid-tag'});
          }

          return tag;
        };

        self.remove = function(index) {
          var tag = self.items.splice(index, 1)[0];
          events.trigger('tag-removed', {$tag: tag, $event: 'tag-removed'});
          return tag;
        };

        self.removeLast = function() {
          var tag, lastTagIndex = self.items.length - 1;

          if(options.enableEditingLastTag || self.selected) {
            self.selected = null;
            tag = self.remove(lastTagIndex);
          }
          else if(!self.selected) {
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
        controller: ["$scope", "$attrs", "$element", function($scope, $attrs, $element) {
          tagsInputConfig.load('tagsInput', $scope, $attrs, {
            placeholder: [String, 'Add a tag'],
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
            valueProperty: [String, 'value'],
            allowLeftoverText: [Boolean, false],
            addFromAutocompleteOnly: [Boolean, false],
            //tagClasses: [Object, null],
            tagClass: [String, ''],
            modelType: [String, 'array'],
            arrayValueType: [String, 'object'],
            hideTags: [Boolean, false],
            dropdown: [Boolean, false],
            tagsStyle: [String, 'tags'],
            allowBulk: [Boolean, false],
            bulkDelimiter: [RegExp, /, ?|\n/],
            bulkPlaceholder: [String, 'Enter a list separated by commas or new lines'],
            showButton: [Boolean, false]
          });

          if($scope.itemFormatter) $scope.options.itemFormatter = $scope.itemFormatter;

          if($scope.options.tagsStyle === 'tags') {
            $scope.options.tagClass = $scope.options.tagClass || 'label-primary';
          }

          //console.log('$scope.options.allowBulk:', $scope.options.allowBulk);
          if($scope.options.allowBulk && ($scope.options.modelType !== 'array' || $scope.options.maxTags === 1)) {
            $scope.options.allowBulk = false;
          }

          $scope.events = new SimplePubSub();
          $scope.tagList = new TagList($scope.options, $scope.events);

          this.registerAutocomplete = function() {
            var input = $element.find('input');
            input.on('keydown', function(e) {
              $scope.events.trigger('input-keydown', e);
            });

            return {
              addTag: function(tag) {
                return $scope.tagList.add(tag);
              },
              focusInput: function() {
                //input[0].focus();
              },
              blurInput: function() {
                input[0].blur();
              },
              getTags: function() {
                if($scope.options.modelType === 'array') {
                  return $scope.tagList.items;
                }
                else {
                  return $scope.tagList.items ? [$scope.tagList.items] : [];
                }
              },
              getOptions: function() {
                return $scope.options;
              },
              on: function(name, handler) {
                $scope.events.on(name, handler);
                return this;
              },
              registerProcessBulk: function(fn) {
                $scope.processBulk = function() {
                  fn($scope.bulkTags).then(function() {
                    $scope.showBulk = false;
                    $scope.bulkTags = '';
                  });
                };
              }
            };
          };
        }],
        link: function(scope, element, attrs, ngModelCtrl) {
          var hotkeys = [KEYS.enter, KEYS.comma, KEYS.space, KEYS.backspace],
              tagList = scope.tagList,
              events = scope.events,
              options = scope.options,
              input = element.find('input.input'),
              blurTimeout;

          if(attrs.inputId && !ngModelCtrl.$name) {
            ngModelCtrl.$name = attrs.inputId;
          }

          // before callbacks allow code to modify tag before it's added
          // after callback fired after ngModel has chance to update
          function beforeAndAfter(before, after) {
            return function() {
              var args = arguments;
              before.apply(this, args);
              $timeout(function(){
                after.apply(this, args);
              });
            };
          }

          events
              .on('tag-added', beforeAndAfter(scope.onBeforeTagAdded, scope.onTagAdded))
              .on('tag-removed', beforeAndAfter(scope.onBeforeTagRemoved, scope.onTagRemoved))
              .on('tag-changed', beforeAndAfter(scope.onBeforeTagChanged, scope.onTagChanged))
              .on('tag-init', scope.onInit)
              .on('tag-added tag-removed', function(e) {
                scope.newTag.text = '';
                if(options.modelType === 'array') {
                  //console.log('options.arrayValueType:', options.arrayValueType);
                  if(options.arrayValueType === 'object') {
                    scope.tags = scope.tagList.items;
                  }
                  else {
                    //console.log('_.pluck:', options.valueProperty, _.pluck(scope.tagList.items, options.valueProperty), scope.tagList.items);
                    scope.tags = _.pluck(scope.tagList.items, options.valueProperty);
                  }
                }
                else {
                  if(e.$event === 'tag-removed') {
                    //ngModelCtrl.$setViewValue(undefined);
                    scope.tags = undefined;
                  }
                  else {
                    if(options.modelType === 'object') {
                      //ngModelCtrl.$setViewValue(e.$tag);
                      scope.tags = e.$tag;
                    }
                    else {
                      //ngModelCtrl.$setViewValue(e.$tag.value);
                      scope.tags = _.has(e.$tag, options.valueProperty) ?
                          e.$tag[options.valueProperty] : e.$tag[options.displayProperty];
                    }
                    //scope.tags = [e.$tag];
                  }
                }
              })
              .on('invalid-tag', function() {
                scope.newTag.invalid = true;
              })
              .on('input-change', function() {
                tagList.selected = null;
                scope.newTag.invalid = null;
              })
              .on('input-focus', function() {
                ngModelCtrl.$setValidity('leftoverText', true);
              })
              .on('input-blur', function() {
                if(!options.addFromAutocompleteOnly) {
                  if(options.addOnBlur && scope.newTag.text) {
                    tagList.addText(scope.newTag.text);
                  }

                  ngModelCtrl.$setValidity('leftoverText', options.allowLeftoverText ? true : !scope.newTag.text);
                }
              });

          scope.newTag = {text: '', invalid: null};

          scope.getDisplayText = scope.itemFormatter || function(tag) {
            return tag && ((tag[options.displayProperty] || 'undefined') + '').trim();
          };

          scope.track = function(tag) {
            return tag[options.displayProperty];
          };

          scope.newTagChange = function() {
            events.trigger('input-change', scope.newTag.text);
          };

          scope.processBulk = scope.processBulk || function() {
            var tags = scope.bulkTags.split(options.bulkDelimiter);
            _.each(tags, function(text) {
              var tag = {};
              tag[options.displayProperty] = text;
              scope.tagList.add(tag);
            });
            scope.showBulk = false;
            scope.bulkTags = '';
          };

          var first = true;

          scope.triggerInit = function(value, prev) {
            var criteria = {};
            criteria[options.valueProperty] = value;
            if(!tagList.items.length || !_.find(tagList.items, criteria)) {
              events.trigger('tag-init', {
                $tag: value,
                $prev: prev,
                $event: 'tag-init',
                $setter: function(val) {
                  if(val && !_.isObject(val)) {
                    var newVal = {};
                    newVal[options.displayProperty] = val;
                    newVal[options.valueProperty] = val;
                    tagList.items = [newVal];
                  }
                  else {
                    tagList.items = _.isArray(val) ? val : [val];
                  }
                  return tagList.items;
                }
              });
            }
          };

          scope.$watch('tags', function(value, prev) {
            var changed = !angular.equals(value, prev);
            var init    = !changed && first;

            if(init) {
              scope.triggerInit(value, prev);
            }
            if(changed) {
              events.trigger('tag-changed', {
                $tag: value,
                $prev: prev,
                $event: 'tag-changed'
              });
            }

            if(options.modelType === 'array') {
              //console.log('array:', value, tagList.items);
              if(_.isArray(value)) {
                if(value.length) {
                  if(!matchTagsWithModel(tagList.items, scope.tags, options.valueProperty)) {
                    scope.triggerInit(value, prev);
                  }
                  if(tagList.items.length !== scope.tags.length) {
                    tagList.items = makeObjectArray(value, options.displayProperty, options.valueProperty);
                    if(options.arrayValueType !== 'object') {
                      scope.tags = _.pluck(tagList.items, options.valueProperty);

                      //console.log('first, init:', first, init, scope.tags);
                      return;
                    }
                  }
                }
                else {
                  tagList.items = [];
                  if(angular.isUndefined(prev)) return;
                }
              }
              else if(value === undefined) {
                tagList.items = [];
                scope.tags = [];
                return;
              }
            }
            else if(angular.isDefined(value)) {
              if(_.isArray(value)) {
                if(value.length) {
                  if(options.modelType === 'object') {
                    scope.tags = value[0];
                  }
                  else {
                    scope.tags = value[0][options.valueProperty];
                  }

                  return;
                }
                else {
                  scope.tags = undefined;
                }
              }
              else {
                if(options.modelType === 'object') {
                  tagList.items = [value];
                }
                else {
                  if(_.isObject(value)) {
                    tagList.items = [value];

                    var val = value[options.valueProperty];
                    if(!val) val = value[options.displayProperty];
                    scope.tags = val;

                    return;
                  }
                  else {
                    //console.log('value, tagList.items:', value, tagList.items);
                    if(value && !tagList.items.length) {
                      scope.triggerInit(value, prev);
                    }
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
                    //console.log('val:', val);
                    //scope.tags = val;
                  //}
                }
              }
            }
            else if(!value && tagList.items.length) {
              //console.log('value, tagList.items[0]:', value, tagList.items[0]);
              tagList.items = [];
            }

            if(!init && changed) {
              ngModelCtrl.$setDirty();
              //console.log('ngModelCtrl.$pristine:', ngModelCtrl.$pristine);
            }

            // hack because schemaForm is incorrectly invalidating model sometimes
            ngModelCtrl.$setValidity('schemaForm', true);
            if(options.modelType === 'array') {
              //console.log('options.minTags:', attrs.inputId, options.minTags, value, value && value.length, value ? angular.isDefined(options.minTags) ? value.length >= options.minTags : true : false);
              ngModelCtrl.$setValidity('tv4-401', value && options.maxTags ? value.length <= options.maxTags : true);
              ngModelCtrl.$setValidity('tv4-302', value ? angular.isDefined(options.minTags) ? value.length >= options.minTags : true : false);
            }
            else {
              //console.log('options.required:', attrs.inputId, options.required, !options.required || !!value, value);
              ngModelCtrl.$setValidity('tv4-302', !options.required || !(angular.isUndefined(value)));
            }

            first = false;

          }, true);

          input
              .on('keydown', function(e) {
                // This hack is needed because jqLite doesn't implement stopImmediatePropagation properly.
                // I've sent a PR to Angular addressing this issue and hopefully it'll be fixed soon.
                // https://github.com/angular/angular.js/pull/4833
                if(e.isImmediatePropagationStopped && e.isImmediatePropagationStopped()) {
                  return;
                }

                var key = e.keyCode,
                    isModifier = e.shiftKey || e.altKey || e.ctrlKey || e.metaKey,
                    addKeys = {},
                    shouldAdd, shouldRemove;

                if(isModifier || hotkeys.indexOf(key) === -1) {
                  return;
                }

                addKeys[KEYS.enter] = options.addOnEnter;
                addKeys[KEYS.comma] = options.addOnComma;
                addKeys[KEYS.space] = options.addOnSpace;

                shouldAdd = !options.addFromAutocompleteOnly && addKeys[key];
                shouldRemove = !shouldAdd && key === KEYS.backspace && scope.newTag.text.length === 0;

                if(shouldAdd) {
                  tagList.addText(scope.newTag.text);

                  scope.$apply();
                  e.preventDefault();
                }
                else if(shouldRemove) {
                  var tag = tagList.removeLast();
                  if(tag && options.enableEditingLastTag) {
                    scope.newTag.text = tag[options.displayProperty];
                  }

                  scope.$apply();
                  e.preventDefault();
                }
              })
              .on('focus', onFocus)
              .on('blur', function(e) {
                blurTimeout = $timeout(function() {
                  var activeElement = $document.prop('activeElement'),
                      lostFocusToBrowserWindow = activeElement === input[0],
                      lostFocusToChildElement = element[0].contains(activeElement);

                  //console.log('lostFocusToBrowserWindow, !lostFocusToChildElement:', lostFocusToBrowserWindow, !lostFocusToChildElement);
                  if(lostFocusToBrowserWindow || !lostFocusToChildElement) {
                    scope.hasFocus = false;
                    events.trigger('input-blur', e);
                  }
                }, 150); // timeout so that click event triggers first
              });

          element.find('textarea').on('keydown', function(e) {
            if(!e.altKey && !e.ctrlKey && !e.metaKey && e.keyCode === KEYS.enter) {
              e.preventDefault();
              scope.processBulk();
            }
          });

          element.find('div').on('click', function(e) {
            if(!$(e.target).closest('.suggestion').length) {
              e.preventDefault();
              input[0].focus();
            }
          });

          function onFocus(e) {
            if(e) e.preventDefault();

            if(scope.ngDisabled) return;

            scope.hasFocus = true;
            //console.log('onFocus:', input.val());
            events.trigger('input-focus', input.val());

            if(!/apply|digest/.test(scope.$root.$$phase)) scope.$apply();
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
  tagsInput.directive('autoComplete', [
    "$document", "$timeout", "$filter", "$sce", "tagsInputConfig", "$parse", 'Api',
    function($document, $timeout, $filter, $sce, tagsInputConfig, $parse, Api) {
      function SuggestionList(scope, options) {
        var self = {}, debouncedLoadId, getDifference, lastPromise, groupList,
            splitListItems, formatItemText, mapIndexes;

        groupList = function(list, groupBy) {
          var filtered = {},
              map = [],
              index = 0,
              keys;

          // loop through each item in the list
          _.each(list, function(item) {
            keys = $parse(groupBy)(item);
            if(!_.isArray(keys)) keys = [keys];
            _.each(keys, function(key) {
              if(!filtered[key]) {
                filtered[key] = [];
              }
              filtered[key].push(item);
            });
          });

          _.each(filtered, function(group) {
            group.indexes = [];
            _.each(group, function(item) {
              group.indexes.push(index++);
              map.push(item);
            });
          });

          return {
            groups: filtered,
            map: map
          };
        };

        formatItemText = function(item, formatter) {
          if(formatter) {
            if(!_.isArray(formatter)) {
              formatter = [formatter, {}];
            }
            return $parse(formatter[0])((formatter[1].val = item) && formatter[1]);
          }

          return item;
        };

        splitListItems = function(items) {
          var keys = [];

          function addItem(key, item, group, prop) {
            var text = _.isObject(item) ? item[prop || options.tagsInput.displayProperty] : item,
                toAdd = {
                  text: formatItemText(text, group.formatter),
                  value: text,
                  key: key,
                  childKey: prop/*,
                  tagClass: options.tagClasses && options.tagClasses[key] || options.tagClass*/
                };

            if(!_.find(group.items, toAdd)) {
              group.items.push(toAdd);
            }
          }

          _.each(scope.searchKeys, function(group) {
            var key = group.key;
            group.items = [];

            _.each(items, function(item) {
              if(item[key]) {
                if(_.isArray(item[key])) {
                  _.each(item[key], function(child) {
                    addItem(key, child, group, group.childKey);
                  });
                }
                else {
                  addItem(key, item[key], group, group.childKey);
                }
              }
            });
            keys.push(group);
          });

          return keys;
        };

        mapIndexes = function(items) {
          var map = [],
              index = 0;

          _.each(items, function(group) {
            group.indexes = [];
            _.each(group.items, function(item) {
              group.indexes.push(index++);
              map.push(item);
            });
          });

          return map;
        };

        getDifference = function(array1, array2) {
          //console.log('getDifference:', array1, array2);
          if(!array2.length) {
            return array1.filter(function(item) {
              return item[options.tagsInput.displayProperty] !== '';
            });
          }
          //console.log('options.tagsInput.valueProperty:', options.tagsInput.valueProperty);
          return array1.filter(function(item) {
            return !findInObjectArray(
                array2,
                item,
                _.has(item, options.tagsInput.valueProperty) ? options.tagsInput.valueProperty : options.tagsInput.getTagText
            );
          });
        };

        self.reset = function() {
          lastPromise = null;

          self.items = [];
          self.visible = false;
          self.index = -1;
          self.selected = null;
          self.query = null;

          $timeout.cancel(debouncedLoadId);
        };

        self.show = function() {
          if(self.visible) return;
          self.selected = null;
          self.visible = true;
          self.select(0);
        };

        self.load = function(query, tags) {
          if(query.length < options.minLength) {
            self.reset();
            return;
          }

          var promise,
              filterBy = {},
              groups,
              processItems = function(items) {
                if(promise && promise !== lastPromise) {
                  return;
                }

                if(scope.searchKeys) {
                  scope.isGroups = true;
                  filterBy = query;
                  items = splitListItems(items);
                }
                if(_.isObject(items) && !_.isArray(items)) {
                  scope.isGroups = true;
                  items = _.map(items, function(list, group) {
                    return {
                      items: list,
                      label: group
                    };
                  });
                }
                if(scope.isGroups) {
                  _.each(items, function(group) {
                    group.items = getDifference(group.items, tags);
                    if(query) group.items = $filter('cnFilter')(group.items, filterBy);

                    group.items = group.items.slice(0, options.maxResultsToShow);
                  });
                  self.itemMap = mapIndexes(items);
                }
                else {
                  filterBy[options.tagsInput.displayProperty] = query;
                  items = makeObjectArray(items.data || items, options.tagsInput.displayProperty);
                  items = getDifference(items, tags);
                  //console.log('options.skipFiltering:', options.skipFiltering);
                  if(query && !options.skipFiltering) {
                    items = $filter('cnFilter')(items, filterBy);
                  }

                  items = items.slice(0, options.maxResultsToShow);

                  if(options.groupBy) {
                    groups = groupList(items, options.groupBy);
                    items = groups.groups;
                    self.itemMap = groups.map;
                  }
                }

                self.items = items;

                if(!_.isEmpty(self.items)) {
                  self.show();
                }
                else {
                  self.reset();
                }
              };

          $timeout.cancel(debouncedLoadId);
          self.query = query;
          debouncedLoadId = $timeout(function() {
            var source = scope.source({$query: query});
            if(_.isArray(source)) {
              $timeout(function() {
                processItems(source || []);
              });
            }
            else {
              if(!options.minLength) {
                source.then(function(results) {
                  scope.source = function() {
                    return results;
                  };
                  processItems(results || []);
                });
              }
              else {
                promise = source;
                lastPromise = promise;
                promise.then(processItems);
              }
            }
          }, options.minLength ? options.debounceDelay : 0, false);

        };
        self.selectNext = function() {
          self.select(++self.index);
        };
        self.selectPrior = function() {
          self.select(--self.index);
        };
        self.select = function(index) {
          var list = self.itemMap || self.items;
          if(index < 0) {
            index = list.length - 1;
          }
          else if(index >= list.length) {
            index = 0;
          }
          self.index = index;
          if(self.itemMap) {
            self.selected = self.itemMap[index];
          }
          else {
            self.selected = self.items[index];
          }
        };

        self.reset();

        return self;
      }

      function encodeHTML(value) {
        return value ? value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;') : '';
      }

      return {
        restrict: 'E',
        require: '^tagsInput',
        scope: {
          source: '&',
          searchKeys: '=?'
        },
        templateUrl: function(elem, attrs) {
          //console.log('attrs:', attrs);
          return attrs.customTemplateUrl || 'cnTagsInput/auto-complete.html';
        },
        link: function(scope, element, attrs, tagsInputCtrl) {
          var hotkeys = [KEYS.enter, KEYS.tab, KEYS.escape, KEYS.up, KEYS.down],
              suggestionList, tagsInput, options, getItemText, documentClick;

          tagsInputConfig.load('autoComplete', scope, attrs, {
            debounceDelay: [Number, 1000],
            minLength: [Number, 3],
            highlightMatchedText: [Boolean, true],
            maxResultsToShow: [Number, 75],
            groupBy: [String, ''],
            skipFiltering: [Boolean, false]
          });

          options = scope.options;

          tagsInput = tagsInputCtrl.registerAutocomplete();
          options.tagsInput = tagsInput.getOptions();

          if(options.minLength === 0/* && _.isArray(scope.source())*/) {
            options.tagsInput.dropdown = true;
            if(options.tagsInput.maxTags === 1) {
              options.tagsInput.dropdownStyle = 'caret';
            }
            else {
              options.tagsInput.dropdownStyle = 'fa fa-plus';
            }
          }
          else {
            options.tagsInput.dropdownStyle = 'fa fa-search';
          }

          suggestionList = new SuggestionList(scope, options);

          getItemText = options.tagsInput.itemFormatter || function(item) {
            return String(item[options.tagsInput.displayProperty]);
          };

          scope.suggestionList = suggestionList;

          scope.addSuggestion = function(e) {
            //console.log('addSuggestion:', e);
            e.preventDefault();
            var added = false;

            if(suggestionList.selected) {
              tagsInput.addTag(suggestionList.selected);

              if(!options.tagsInput.maxTags || tagsInput.getTags().length < options.tagsInput.maxTags) {
                if(options.minLength) {
                  suggestionList.reset();
                }
                else {
                  suggestionList.load('', tagsInput.getTags());
                }
                tagsInput.focusInput();
              }
              else {
                suggestionList.reset();
                tagsInput.blurInput();
              }

              added = true;
            }
            return added;
          };

          scope.highlight = function(item, key) {
            var text = getItemText(item, key);
            text = encodeHTML(text);
            if(suggestionList.query && options.highlightMatchedText) {
              text = replaceAll(text, encodeHTML(suggestionList.query), '<b>$&</b>');
            }
            return $sce.trustAsHtml('<a>' + text + '</a>');
          };

          scope.track = function(item, key) {
            return getItemText(item, key);
          };

          tagsInput.registerProcessBulk(function(bulkTags) {
            console.log('autoCompleteProcessBulk:', bulkTags);

            var tags = bulkTags.split(options.tagsInput.bulkDelimiter);
            var addTag = function(data) {
              if(data[0]) tagsInput.addTag(data[0]);
            };

            // in case a query is involved...doesn't hurt to use even if not
            return Api.batch(function() {
              for(var i = 0, l = tags.length; i < l; i++) {
                if(options.tagsInput.maxTags && tagsInput.getTags().length >= options.tagsInput.maxTags) break;

                var results = scope.source({$query: tags[i]});

                if(_.isArray(results) && results[0]) {
                  if(!options.skipFiltering) {
                    var filterBy = {};
                    filterBy[options.tagsInput.displayProperty] = tags[i];
                    results = $filter('cnFilter')(results, filterBy);
                  }
                  tagsInput.addTag(results[0]);
                }
                else if(results.then) {
                  results.then(addTag);
                }
              }
            });
          });

          tagsInput
              .on('tag-added invalid-tag', function() {
                if(options.minLength) {
                  suggestionList.reset();
                }
                else {
                  suggestionList.load('', tagsInput.getTags());
                }
              })
              .on('input-change', function(value) {
                if(value || !options.minLength) {
                  suggestionList.load(value, tagsInput.getTags());
                }
                else {
                  suggestionList.reset();
                }
              })
              .on('input-focus', function(value) {
                //console.log('input-focus:', options.minLength);
                if(!options.minLength) {
                  suggestionList.load(value, tagsInput.getTags());
                }
              })
              .on('input-keydown', function(e) {
                var key, handled;

                if(hotkeys.indexOf(e.keyCode) === -1) {
                  return;
                }

                // This hack is needed because jqLite doesn't implement stopImmediatePropagation properly.
                // I've sent a PR to Angular addressing this issue and hopefully it'll be fixed soon.
                // https://github.com/angular/angular.js/pull/4833
                var immediatePropagationStopped = false;
                e.stopImmediatePropagation = function() {
                  immediatePropagationStopped = true;
                  e.stopPropagation();
                };
                e.isImmediatePropagationStopped = function() {
                  return immediatePropagationStopped;
                };

                if(suggestionList.visible) {
                  key = e.keyCode;
                  handled = false;

                  if(key === KEYS.down) {
                    suggestionList.selectNext();
                    handled = true;
                  }
                  else if(key === KEYS.up) {
                    suggestionList.selectPrior();
                    handled = true;
                  }
                  else if(key === KEYS.escape) {
                    suggestionList.reset();
                    handled = true;
                  }
                  else if(key === KEYS.enter/* || key === KEYS.tab*/) {
                    handled = scope.addSuggestion(e);
                  }

                  if(handled) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    scope.$apply();
                  }
                }
              })
              .on('input-blur', function(e) {
                //changed to use document click or focus, as this fires too soon and cancels
                //automcomplete click events
                //suggestionList.reset();
              });

          documentClick = function(e) {
            if(e.isDefaultPrevented()) return;

            if(suggestionList.visible) {
              // if autocomplete option was selected, or click/focus triggered outside of directive
              if(($(e.target).closest('.suggestion').length || !$(e.target).closest(element[0]).length) &&
                  !(e.type === 'focusin' && !/^(input|select|textarea|button|a)$/i.test(e.target.tagName))) {
                suggestionList.reset();
                if(!/apply|digest/.test(scope.$root.$$phase)) scope.$apply();
              }
            }
          };

          $document.on('click focusin', documentClick);

          scope.$on('$destroy', function() {
            $document.off('click focusin', documentClick);
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
  tagsInput.directive('tiTranscludeAppend', function() {
    return function(scope, element, attrs, ctrl, transcludeFn) {
      transcludeFn(function(clone) {
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
  tagsInput.directive('tiAutosize', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ctrl) {
        var THRESHOLD = 3,
            span, resize;

        span = angular.element('<span class="input"></span>');
        span.css('display', 'none')
            .css('visibility', 'hidden')
            .css('width', 'auto')
            .css('white-space', 'pre');

        element.parent().append(span);

        resize = function(originalValue) {
          var value = originalValue, width;

          if(angular.isString(value) && value.length === 0) {
            value = attrs.placeholder;
          }

          if(value) {
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

        attrs.$observe('placeholder', function(value) {
          if(!ctrl.$modelValue) {
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
  tagsInput.provider('tagsInputConfig', function() {
    var globalDefaults = {}, interpolationStatus = {};

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
    this.setDefaults = function(directive, defaults) {
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
    this.setActiveInterpolation = function(directive, options) {
      interpolationStatus[directive] = options;
      return this;
    };

    this.$get = ["$interpolate", function($interpolate) {
      var converters = {};
      converters[String] = function(value) {
        return value;
      };
      converters[Number] = function(value) {
        return parseInt(value, 10);
      };
      converters[Boolean] = function(value) {
        return value.toLowerCase() === 'true';
      };
      converters[RegExp] = function(value) {
        return new RegExp(value);
      };
      converters[Object] = function(value) {
        return typeof value === 'object' ? value : Object(value);
      };

      return {
        load: function(directive, scope, attrs, options) {
          scope.options = {};
          scope.attrs = attrs;
          scope.uid = _.uniqueId();

          angular.forEach(options, function(value, key) {
            var type, localDefault, converter, getDefault, updateValue;

            type = value[0];
            localDefault = value[1];
            converter = converters[type];

            getDefault = function() {
              var globalValue = globalDefaults[directive] && globalDefaults[directive][key];
              return angular.isDefined(globalValue) ? globalValue : localDefault;
            };

            updateValue = function(value) {
              scope.options[key] = value ? converter(value) : getDefault();
            };

            if(scope[key]) {
              updateValue(scope[key]);
            }
            else if(interpolationStatus[directive] && interpolationStatus[directive][key]) {
              attrs.$observe(key, function(value) {
                updateValue(value);
              });
            }
            else {
              updateValue(attrs[key] && $interpolate(attrs[key])(scope.$parent));
            }
          });
        }
      };
    }];
  });


  /* HTML templates */
  tagsInput.run(["$templateCache", function($templateCache) {
    $templateCache.put('cnTagsInput/tags-input.html',
        "\
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
            <span class=\"tag-item\">{{getDisplayText(tag) | trustAsHtml}}</span> \
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
                  ng-if=\"options.tagsStyle !== 'list' && !options.hideTags && options.maxTags === 1 && tagList.items.length\">\
              <span title=\"{{getDisplayText(tagList.items[0])}}\">\
                {{getDisplayText(tagList.items[0]) | trustAsHtml}}\
              </span> \
              <a class=\"remove-button\" \
                 ng-if=\"!ngDisabled && !options.dropdown\"\
                 ng-click=\"tagList.remove()\">\
                <span>&times;</span>\
              </a>\
            </span>\
            <ul class=\"tag-list\" \
                ng-if=\"options.tagsStyle !== 'list' && !options.hideTags && options.maxTags !== 1\">\
              <li class=\"tag-item label {{options.tagClass}}\" \
                  ng-repeat=\"tag in tagList.items\" \
                  ng-class=\"{ selected: tag == tagList.selected }\">\
                <span>{{getDisplayText(tag) | trustAsHtml}}</span> \
                <a class=\"remove-button\" \
                   ng-if=\"!ngDisabled\"\
                   ng-click=\"tagList.remove($index)\">\
                  <span>&times;</span>\
                </a>\
              </li>\
            </ul>\
            <button ng-if=\"options.showButton && options.dropdown\"\
                    class=\"btn form-control-icon\" ng-disabled=\"ngDisabled\">\
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
        </div>"
    );

    $templateCache.put('cnTagsInput/auto-complete.html',
        "<div ng-if=\"!suggestionList.items.length && !options.groupBy\" \
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
        </div>"
    );
  }]);
})();