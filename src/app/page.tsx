'use client';

import { useAppStore } from '@/lib/store';
import { AnimatePresence, motion } from 'framer-motion';
import WriteScene from '@/components/shredder/WriteScene';
import ShredScene from '@/components/shredder/ShredScene';
import CollectScene from '@/components/trash/CollectScene';
import LaunchScene from '@/components/rocket/LaunchScene';
import ExplodeScene from '@/components/universe/ExplodeScene';

export default function Home() {
  const { scene } = useAppStore();

  const currentScene = () => {
    switch (scene) {
      case 'write': return
cat > src/app/page.tsx << 'EOF'
'use client';

import { useAppStore } from '@/lib/store';
import { AnimatePresence, motion } from 'framer-motion';
import WriteScene from '@/components/shredder/WriteScene';
import ShredScene from '@/components/shredder/ShredScene';
import CollectScene from '@/components/trash/CollectScene';
import LaunchScene from '@/components/rocket/LaunchScene';
import ExplodeScene from '@/components/universe/ExplodeScene';

export default function Home() {
  const { scene } = useAppStore();

  const currentScene = () => {
    switch (scene) {
      case 'write': return <WriteScene />;
      case 'shred': return <ShredScene />;
      case 'collect': return <CollectScene />;
      case 'launch': return <LaunchScene />;
      case 'fly':
      case 'explode': return <ExplodeScene />;
      default: return <WriteScene />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scene}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {currentScene()}
      </motion.div>
    </AnimatePresence>
  );
}
