import React from 'react';
import {
  Alert,
  Button,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

type Destination = {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
};

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const [destinations, setDestinations] = React.useState<Destination[]>([]);
  const [showAddDestination, setShowAddDestination] = React.useState(false);

  const onAddDestination = (dest: Omit<Destination, 'id'>) => {
    let list = [];
    if (destinations.length === 0) {
      list = [{id: '1', ...dest}];
    } else {
      const lastDestinationId = destinations[destinations.length - 1].id;
      list = [
        ...destinations,
        {id: (Number(lastDestinationId) + 1).toString(), ...dest},
      ];
    }

    setDestinations(list);
    setShowAddDestination(false);
  };

  const onRemoveDestination = (id: string) => {
    const newDestinations = destinations.filter(dest => dest.id !== id);
    setDestinations([...newDestinations]);
  };

  return (
    <SafeAreaView style={styles.f1}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      {showAddDestination ? (
        <AddDestinationView
          onFinish={onAddDestination}
          onCancel={() => setShowAddDestination(false)}
        />
      ) : (
        <>
          <View style={backgroundStyle}>
            <Text style={styles.welcomeText}>
              Welcome to your destination manager!
            </Text>
          </View>
          <ScrollView
            style={styles.f1}
            contentContainerStyle={styles.basePadding}>
            <Text style={styles.title}>Destinations</Text>
            {destinations.length === 0 ? (
              <Text>There is no destination</Text>
            ) : (
              destinations.map(destination => (
                <DestinationRow
                  key={destination.id}
                  destination={destination}
                  onRemove={onRemoveDestination}
                />
              ))
            )}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <Button
              color="black"
              title="Add Destination"
              onPress={() => {
                setShowAddDestination(true);
              }}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
const LAT_LON_REGEX = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;

type AddDestinationViewProps = {
  onFinish: (destination: Omit<Destination, 'id'>) => void;
  onCancel: () => void;
};

const AddDestinationView = ({onFinish, onCancel}: AddDestinationViewProps) => {
  const [form, setForm] = React.useState<Omit<Destination, 'id'>>({
    name: '',
    latitude: '',
    longitude: '',
  });
  const [errorMessage, setErrorMessage] = React.useState('');

  const onSave = () => {
    if (form.name === '') {
      setErrorMessage('Name is required');
      return;
    }

    if (form.latitude === '') {
      setErrorMessage('Latitude is required');
      return;
    }

    if (form.longitude === '') {
      setErrorMessage('Longitude is required');
      return;
    }

    if (!LAT_LON_REGEX.test(form.latitude)) {
      setErrorMessage('Latitude is not valid');
      return;
    }

    if (!LAT_LON_REGEX.test(form.longitude)) {
      setErrorMessage('Longitude is not valid');
      return;
    }

    onFinish(form);
  };

  return (
    <View style={styles.f1}>
      <View style={styles.basePadding}>
        <Text style={styles.title}>Add Destination</Text>
        <Text>Name</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={name => {
            setErrorMessage('');
            setForm({...form, name});
          }}
        />
        <Text>Latitude</Text>
        <TextInput
          style={styles.input}
          value={form.latitude}
          onChangeText={latitude => {
            setErrorMessage('');
            setForm({...form, latitude});
          }}
        />
        <Text>Longitude</Text>
        <TextInput
          style={styles.input}
          value={form.longitude}
          onChangeText={longitude => {
            setErrorMessage('');
            setForm({...form, longitude});
          }}
        />
        {errorMessage !== '' && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <Button color="red" title="Cancel" onPress={onCancel} />
        <Button color="black" title="Save" onPress={onSave} />
      </View>
    </View>
  );
};

const getParams = (params = []) => {
  return params
    .map(({key, value}) => {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      return `${encodedKey}=${encodedValue}`;
    })
    .join('&');
};

const getSchemeAndUrl = async (
  lat: string,
  lon: string,
  coords = {latitude: '41.0052041', longitude: '28.8473737'}, // İstanbul
  params = [
    {
      key: 'travelmode',
      value: 'driving', // may be "walking", "bicycling" or "transit" as well
    },
  ],
): Promise<string> => {
  params.push({
    key: 'destination',
    value: `${lat},${lon}`,
  });
  params.push({
    key: 'origin',
    value: `${coords.latitude},${coords.longitude}`,
  });
  const url = `https://www.google.com/maps/dir/?api=1&${getParams(params)}`;
  return new Promise(resolve => {
    resolve(url);
  });
};

type DestinationRowProps = {
  destination: Destination;
  onRemove: (id: string) => void;
};

const DestinationRow = ({destination, onRemove}: DestinationRowProps) => {
  const onGo = async () => {
    try {
      const url = await getSchemeAndUrl(
        destination.latitude,
        destination.longitude,
      );
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(`Don't know how to open this URL: ${url}`);
      }
    } catch (error) {
      console.log('error on onGo', error);
      Alert.alert('Error on onGo');
    }
  };

  return (
    <View style={styles.row}>
      <Text>
        {destination.name} ({destination.latitude},{destination.longitude})
      </Text>
      <View style={styles.rowEnd}>
        <Pressable style={styles.mr10} onPress={onGo}>
          <Text style={styles.underline}>Go</Text>
        </Pressable>
        <Pressable onPress={() => onRemove(destination.id)}>
          <Text style={styles.underline}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  f1: {
    flex: 1,
  },
  basePadding: {
    padding: 15,
  },
  mr10: {
    marginRight: 10,
  },
  welcomeText: {
    marginVertical: 20,
    textAlign: 'center',
  },
  title: {
    fontWeight: 'bold',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 5,
    marginBottom: 10,
  },
  errorMessage: {
    color: 'red',
    fontSize: 20,
    textAlign: 'center',
  },
  row: {
    padding: 10,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowEnd: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default App;
