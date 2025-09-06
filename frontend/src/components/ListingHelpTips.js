const ListingHelpTips = () => {
  const tips = [
    {
      title: 'Take Great Photos',
      description: 'Use natural lighting and show multiple angles. Include close-ups of any wear or damage.',
      icon: '📸'
    },
    {
      title: 'Write Clear Descriptions',
      description: 'Be honest about condition, include measurements, and mention any flaws.',
      icon: '📝'
    },
    {
      title: 'Price Competitively',
      description: 'Research similar items to set a fair price. Consider the item\'s age and condition.',
      icon: '💰'
    },
    {
      title: 'Choose the Right Category',
      description: 'Proper categorization helps buyers find your item quickly.',
      icon: '🏷️'
    }
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Listing Tips for Success
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start space-x-3">
            <span className="text-xl">{tip.icon}</span>
            <div>
              <h4 className="font-medium text-blue-800 text-sm">{tip.title}</h4>
              <p className="text-blue-700 text-xs">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingHelpTips;
