import React from 'react';
import {
  Button,
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

  return (
    <SafeAreaView style={styles.f1}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      {showAddDestination ? (
        <AddDestinationView
          onFinish={dest => {
            let list = [];
            if (destinations.length === 0) {
              list = [{id: '1', ...dest}];
            } else {
              const lastDestinationId =
                destinations[destinations.length - 1].id;
              list = [
                ...destinations,
                {id: (Number(lastDestinationId) + 1).toString(), ...dest},
              ];
            }

            setDestinations(list);
            setShowAddDestination(false);
          }}
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
                  onRemove={() => {
                    const newDestinations = destinations.filter(
                      dest => dest.id !== destination.id,
                    );
                    setDestinations([...newDestinations]);
                  }}
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
const latRegex = /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,15}/g;
const longRegex = /^-?(([-+]?)([\d]{1,3})((\.)(\d+))?)/g;

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
        <Button
          color="black"
          title="Save"
          onPress={() => {
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

            if (!latRegex.test(form.latitude)) {
              setErrorMessage('Latitude is not valid');
              return;
            }

            if (!longRegex.test(form.longitude)) {
              setErrorMessage('Longitude is not valid');
              return;
            }

            onFinish(form);
          }}
        />
      </View>
    </View>
  );
};

type DestinationRowProps = {
  destination: Destination;
  onRemove: () => void;
};

const DestinationRow = ({destination, onRemove}: DestinationRowProps) => {
  return (
    <View style={styles.row}>
      <Text>
        {destination.name} ({destination.latitude},{destination.longitude})
      </Text>
      <View style={styles.rowEnd}>
        <Pressable style={styles.mr10} onPress={() => {}}>
          <Text style={styles.underline}>Go</Text>
        </Pressable>
        <Pressable onPress={onRemove}>
          <Text style={styles.underline}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeText: {
    marginVertical: 20,
    textAlign: 'center',
  },
  f1: {
    flex: 1,
  },
  basePadding: {
    padding: 15,
  },
  mr10: {
    marginRight: 10,
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
    borderWidth: 1,
    borderColor: 'gray',
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
