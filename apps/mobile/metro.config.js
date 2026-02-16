const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
// The actual monorepo root is 2 levels up from apps/mobile
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Explicitly map dependencies to root node_modules
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Extra Node Modules mapping (Classic fix)
config.resolver.extraNodeModules = {
    'react-native-gesture-handler': path.resolve(workspaceRoot, 'node_modules/react-native-gesture-handler'),
    'react-native': path.resolve(workspaceRoot, 'node_modules/react-native'),
    'expo': path.resolve(workspaceRoot, 'node_modules/expo'),
};

// 4. Force hierarchical lookup to be ENABLED (false means it will search parent directories)
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
