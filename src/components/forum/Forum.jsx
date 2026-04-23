import { useState } from 'react';
import ForumTopicList from './ForumTopicList';
import ForumTopicDetail from './ForumTopicDetail';

const Forum = () => {
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  if (selectedTopicId) {
    return (
      <ForumTopicDetail
        topicId={selectedTopicId}
        onBack={() => setSelectedTopicId(null)}
      />
    );
  }

  return <ForumTopicList onSelectTopic={setSelectedTopicId} />;
};

export default Forum;
