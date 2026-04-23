
const generateTags = (record) => {
    const tags = [];
  const stopWords = ['for', 'and', 'the', 'of', 'in', 'on', 'with', 'a', 'an', 'to', 'by', 'from'];


    if(record.type)
    {
        tags.push(record.type.toLowerCase());

    }


    if(record.organisation)
    {
      tags.push(record.organisation.toLowerCase().replace(/\s+/g, '-').trim());  
    }

if(record.duration_weeks)
{
    tags.push(record.duration_weeks.toString());
   if(record.duration_weeks < 4)
    {
        tags.push('short-term');
    }

    if(record.duration_weeks >= 8)
    {
        tags.push('long-term');
    }

    if(record.duration_weeks >= 4 && record.duration_weeks < 8)
    {
        tags.push('mid-term');
    }
}

if (record.title) {
    const titleWords = record.title.toLowerCase().split(" ")
      .filter(word => !stopWords.includes(word));
    tags.push(...titleWords);
  }

  
  if (record.start_date) {
    const year = new Date(record.start_date).getFullYear();
    tags.push(`${year}`);
  }

  
  if (record.customTags && record.customTags.length > 0) {
    record.customTags.forEach(tag => tags.push(tag.toLowerCase()));
  }

  
  return [...new Set(tags)];
};

module.exports = generateTags;

