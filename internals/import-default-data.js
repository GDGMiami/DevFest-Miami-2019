import { initializeFirebase, firestore } from './firebase-config';
import data from '../docs/default-firebase-data.json';

const importSpeakers = () => {
  const speakers = data.speakers;
  if (!Object.keys(speakers).length) {
    return false;
  }
  console.log('\tImporting', Object.keys(speakers).length, 'speakers...');

  const batch = firestore.batch();

  Object.keys(speakers).forEach((speakerId, order) => {
    batch.set(
      firestore.collection('speakers').doc(speakerId),
      {
        ...speakers[speakerId],
        order,
      },
    );
  });

  return batch.commit()
    .then((results) => {
      console.log('\tImported data for', results.length, 'speakers');
      return results;
    });
};

const importTeam = () => {
  const teams = data.team;
  if (!Object.keys(teams).length) {
    return false;
  }
  console.log('\tImporting', Object.keys(teams).length, 'subteam...');

  const batch = firestore.batch();

  Object.keys(teams).forEach((teamId) => {
    batch.set(
      firestore.collection('team').doc(teamId),
      { title: teams[teamId].title },
    );

    teams[teamId].members.forEach((member, id) => {
      batch.set(
        firestore.collection('team').doc(`${teamId}`).collection('members').doc(`${id}`),
        member,
      );
    })
  });

  return batch.commit()
    .then(results => {
      console.log('\tImported data for', results.length, 'documents');
      return results;
    });
};

const importSessions = () => {
  const docs = data.sessions;
  if (!Object.keys(docs).length) {
    return false;
  }
  console.log('\tImporting sessions...');

  const batch = firestore.batch();

  Object.keys(docs).forEach((docId) => {
    batch.set(
      firestore.collection('sessions').doc(docId),
      docs[docId],
    );
  });

  return batch.commit()
    .then(results => {
      console.log('\tImported data for', results.length, 'sessions');
      return results;
    });
};

const importSchedule = () => {
  const docs = data.schedule;
  if (!Object.keys(docs).length) {
    return false;
  }
  console.log('\tImporting schedule...');

  const batch = firestore.batch();

  Object.keys(docs).forEach((docId) => {
    batch.set(
      firestore.collection('schedule').doc(docId),
      {
          ...docs[docId],
          date: docId,
      },
    );
  });

  return batch.commit()
    .then(results => {
      console.log('\tImported data for', Object.keys(docs).length, 'days');
      return results;
    });
};

const importNotificationsConfig = async () => {
  const notificationsConfig = data.notifications.config;
  console.log('Migrating notifications config...');
  const batch = firestore.batch();

  batch.set(
    firestore.collection('config').doc('notifications'),
    notificationsConfig,
  );

  return batch.commit()
    .then(results => {
      console.log('\tImported data for notifications config');
      return results;
    });

};

initializeFirebase()
  .then(() => importNotificationsConfig())
  .then(() => importSchedule())
  .then(() => importSessions())
  .then(() => importSpeakers())
  .then(() => importTeam())

  .then(() => {
    console.log('Finished');
    process.exit();
  })
  .catch(err => {
    console.log(err);
    process.exit();
  });
