import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, CameraRoll, ScrollView, Dimensions, Image, StatusBar } from 'react-native';
import { Camera, Permissions } from 'expo';

export default class CameraExample extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    images: []
  }

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({hasCameraPermission: status === 'granted'});

    CameraRoll.getPhotos({first: 10}).then(({edges}) => {
      console.log(edges);
      return this.setState({images: edges.map((edge) => edge.node.image)});
    });
  }

  snap() {
    if (this.camera) {
      this.camera.takePictureAsync().then((uri) => {
        console.log(uri);
        CameraRoll.saveToCameraRoll(uri).then((newUri) => {
          console.log(newUri);
        });
      });
    }
  }

  render() {
    const { hasCameraPermission } = this.state;
    const { width, height } = Dimensions.get('window');
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          <StatusBar hidden />
          <Camera
          ref={ref => { this.camera = ref; }}
            style={{width, height }}
            type={this.state.type}>
            <View
              style={{ flex: 1, backgroundColor: 'transparent', flexDirection: 'row'
              }}>
              <TouchableOpacity
                style={{ flex: 0.1, alignSelf: 'flex-end', alignItems: 'center' }}
                onPress={() => {
                  this.setState({
                    type: this.state.type === Camera.Constants.Type.back ?
                      Camera.Constants.Type.front :
                      Camera.Constants.Type.back
                  })
                }}>
              <Text style={{fontSize: 18, marginBottom: 10, color: 'white' }}> Flip </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ flex: 0.1, alignSelf: 'flex-end', alignItems: 'center' }}
                onPress={this.snap.bind(this)}>
              <Text style={{fontSize: 18, marginBottom: 10, color: 'white' }}> Snap </Text>
            </TouchableOpacity>
            </View>
          </Camera>
          <View style={{backgroundColor: 'yellow', width, height}}>
              {this.state.images.map((image) => 
                <Image key={image.uri} style={{width: 50, height: 50}} source={{uri: image.uri}} />
              )}
          </View>
        </ScrollView>
      );
    }
  }
}

// export default class App extends React.Component {
//   render() {
//     return (
//       <View style={styles.container}>
//         <Camera />
//         <Text>Open up App.js to start working on your app!</Text>
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
