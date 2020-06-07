export interface RoutResult {
 'status': number;
 'result': {
  'paths': [
   {
    'distance': number;
    'weight': number;
    'time': number;
    'transfers': number;
    'points_encoded': boolean;
    'bbox': Array<number>;
    'points': {
     'type': string;
     'coordinates': Array<Array<number>>;
    };
    'instructions': [
     {
      'distance': number;
      'heading': number;
      'sign': number;
      'interval': Array<number>;
      'text': string;
      'time': number;
      'street_name': string;
     }
    ];
    'legs': [];
    'details': [];
    'ascend': 0;
    'descend': 0;
    'snapped_waypoints': {
     'type': 'LineString';
     'coordinates': Array<Array<number>>;
    };
   }
  ];
 };
}
