import React from 'react';
import { motion } from 'framer-motion';
// import Imag from '../../profile/profiletest.png';
import ImgPriyanshu from '../../profile/priyanshu.jpg';
import ImgDhaval from '../../profile/dhaval.jpeg';
import ImgHarsh from '../../profile/harsh.jpeg';
import ImgArnav from '../../profile/arnav.jpg';
import ImgShreyansh from '../../profile/shreyansh.jpg';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  linkedin: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Dhaval Vaish', role: 'Cyber Security', image: ImgDhaval,
    linkedin: "https://linkedin.com/in/dhaval-vaish-b40a8a2b6",
  },
  {
    name: 'Shreyansh Mishra', role: 'ML Developer', image: ImgShreyansh,
    linkedin: "https://www.linkedin.com/in/shreyansh-mishra-",
  },
  {
    name: 'Priyanshu Verma', role: 'Frontend Developer', image: ImgPriyanshu,
    linkedin: "https://linkedin.com/in/priyanshu-verma-2k3",
  },  
  {
    name: 'Harsh Awasthi', role: 'Backend Developer', image: ImgHarsh,
    linkedin: "https://www.linkedin.com/in/harsh-awasthi-831a9b27b",
  },
  {
    name: 'Arnav Gupta', role: 'Devops', image: ImgArnav,
    linkedin: "https://www.linkedin.com/in/arnav-gupta-a986712b7",
  },
  // Add more team members as needed
];

const TeamPage: React.FC = () => {
  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white">
      <div className="container mx-auto py-12">
        <h1 className="text-4xl font-bold text-center mb-8">Meet Our Team</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <a href={member.linkedin} target='_blank'>
              <motion.div
                key={index}
                className="bg-gray-800 p-6 rounded-lg shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 5px 12px -3px rgba(128, 90, 213, 0.7), 0 4px 6px -4px rgba(128, 90, 213, 0.7)' }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 "
                />
                <h2 className="text-2xl font-semibold text-center">{member.name}</h2>
                <p className="text-center text-gray-400">{member.role}</p>
              </motion.div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;