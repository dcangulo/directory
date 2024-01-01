import { NextPageContext } from 'next';
import dynamic from 'next/dynamic';
import { useContext, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { A, H4, colors, darkColors, P } from '../common/styleguide';
import ContentContainer from '../components/ContentContainer';
import { Filters } from '../components/Filters';
import { FilterButton } from '../components/Filters/FilterButton';
import LoadingContent from '../components/Library/LoadingContent';
import Navigation from '../components/Navigation';
import PageMeta from '../components/PageMeta';
import CustomAppearanceContext from '../context/CustomAppearanceContext';
import { Library as LibraryType } from '../types';
import getApiUrl from '../util/getApiUrl';
import urlWithQuery from '../util/urlWithQuery';

const LibraryWithLoading = dynamic(() => import('../components/Library'), {
  loading: () => <LoadingContent />,
});

const Trending = ({ data, query }) => {
  const [isFilterVisible, setFilterVisible] = useState(Object.keys(query).length > 0);
  const { isDark } = useContext(CustomAppearanceContext);

  return (
    <>
      <PageMeta
        title="Trending libraries"
        description="See the libraries that are trending today"
        path="trending"
      />
      <Navigation
        title="Trending libraries"
        description="See the libraries that are trending today.">
        <View style={{ width: 160, marginHorizontal: 'auto', marginTop: 12 }}>
          <FilterButton
            style={{ height: 32 }}
            query={query}
            onPress={() => setFilterVisible(!isFilterVisible)}
            isFilterVisible={isFilterVisible}
          />
        </View>
      </Navigation>
      {isFilterVisible && <Filters query={query} basePath="/trending" />}
      <ContentContainer style={styles.container}>
        {data.length ? (
          data.map((item: LibraryType, index: number) => (
            <LibraryWithLoading
              key={`list-item-${index}-${item.github.name}`}
              library={item}
              showPopularity
            />
          ))
        ) : (
          <View style={styles.noResultWrapper}>
            <Image
              style={styles.noResultImg}
              source={require('../assets/notfound.png')}
              alt="No results"
            />
            <H4>Nothing was found!</H4>
          </View>
        )}
        <P style={[styles.note, { color: isDark ? darkColors.secondary : colors.gray5 }]}>
          Unfortunately that&apos;s all, what&apos;s trending now. Want to explore more libraries?
          Check out the{' '}
          <A href={urlWithQuery('/', {})} target="_self">
            directory home page
          </A>
          .
        </P>
      </ContentContainer>
    </>
  );
};

Trending.getInitialProps = async (ctx: NextPageContext) => {
  const url = getApiUrl(
    urlWithQuery('/libraries', {
      ...ctx.query,
      ...{ limit: 9999, minPopularity: 5, order: 'popularity' },
    }),
    ctx
  );
  const response = await fetch(url);
  const result = await response.json();

  return {
    data: result.libraries,
    query: ctx.query,
  };
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  note: {
    padding: 24,
    fontSize: 14,
  },
  noResultWrapper: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 42,
  },
  noResult: {
    marginTop: 12,
  },
  noResultImg: {
    width: 64,
    height: 64,
  },
});

export default Trending;
