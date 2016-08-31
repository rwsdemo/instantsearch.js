/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';


import connect from './connect';
jest.mock('../../core/createConnector');


const {
  getProps,
  refine,
  getSearchParameters: getSP,
  getMetadata,
} = connect;

let props;
let params;

describe('Range.connect', () => {
  it('provides the correct props to the component', () => {
    props = getProps({attributeName: 'ok', min: 5, max: 10}, {}, {});
    expect(props).toEqual({
      min: 5,
      max: 10,
      value: {min: 5, max: 10},
    });

    const results = {
      getFacetStats: () => ({min: 5, max: 10}),
    };
    props = getProps({attributeName: 'ok'}, {}, {results});
    expect(props).toEqual({
      min: 5,
      max: 10,
      value: {min: 5, max: 10},
    });

    props = getProps({attributeName: 'ok'}, {ok: {min: 6, max: 9}}, {});
    expect(props).toBe(null);

    props = getProps({
      attributeName: 'ok',
      min: 5,
      max: 10,
    }, {
      ok: {min: 6, max: 9},
    }, {});
    expect(props).toEqual({
      min: 5,
      max: 10,
      value: {min: 6, max: 9},
    });

    props = getProps({
      attributeName: 'ok',
      min: 5,
      max: 10,
    }, {
      ok: {min: '6', max: '9'},
    }, {});
    expect(props).toEqual({
      min: 5,
      max: 10,
      value: {min: 6, max: 9},
    });

    props = getProps({
      attributeName: 'ok',
      min: 5,
      max: 10,
      defaultValue: {min: 6, max: 9},
    }, {}, {});
    expect(props).toEqual({
      min: 5,
      max: 10,
      value: {min: 6, max: 9},
    });
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({id: 'ok'}, {otherKey: 'val'}, 'yep');
    expect(nextState).toEqual({
      otherKey: 'val',
      ok: 'yep',
    });
  });

  it('refines the corresponding numeric facet', () => {
    params = getSP(
      new SearchParameters(),
      {attributeName: 'facet'},
      {facet: {min: 10, max: 30}}
    );
    expect(params.getNumericRefinements('facet')).toEqual({
      '>=': [10],
      '<=': [30],
    });
  });

  it('registers its filter in metadata', () => {
    let metadata = getMetadata(
      {attributeName: 'wot'},
      {wot: {min: 5}}
    );
    expect(metadata).toEqual({
      id: 'wot',
      filters: [{
        key: 'wot.5 <= wot',
        label: '5 <= wot',
        // Ignore clear, we test it later
        clear: metadata.filters[0].clear,
      }],
    });

    const state = metadata.filters[0].clear({wot: {min: 5}});
    expect(state).toEqual({wot: {}});

    metadata = getMetadata(
      {attributeName: 'wot'},
      {wot: {max: 10}}
    );
    expect(metadata).toEqual({
      id: 'wot',
      filters: [{
        key: 'wot.wot <= 10',
        label: 'wot <= 10',
        clear: metadata.filters[0].clear,
      }],
    });

    metadata = getMetadata(
      {attributeName: 'wot'},
      {wot: {min: 5, max: 10}}
    );
    expect(metadata).toEqual({
      id: 'wot',
      filters: [{
        key: 'wot.5 <= wot <= 10',
        label: '5 <= wot <= 10',
        clear: metadata.filters[0].clear,
      }],
    });
  });
});
