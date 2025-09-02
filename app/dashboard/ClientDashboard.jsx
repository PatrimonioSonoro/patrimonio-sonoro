"use client";
import React from 'react';
import { ChakraProvider, Box, Flex, HStack, Text, IconButton, Avatar, Spacer, Button, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Icon } from '@chakra-ui/react';
import { FiBell, FiChevronDown, FiHome, FiFileText, FiUsers } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

// Sidebar intentionally left out to allow full-width admin panel

function Header({ nombre }) {
  const router = useRouter();

  return (
    <Flex as="header" align="center" py={2} px={4} borderBottom="1px" borderColor="gray.300" bg="white" boxShadow="sm" position="sticky" top={0} zIndex="docked">
      <HStack spacing={3}>
        <Menu>
          <MenuButton
            as={Button}
            variant="ghost"
            rightIcon={<FiChevronDown />}
            px={3}
            py={2}
            borderRadius="md"
            _hover={{ bg: 'gray.100' }}
          >
            Menú
          </MenuButton>
          <MenuList borderRadius="md" py={2} px={1} boxShadow="md">
            <MenuItem icon={<Icon as={FiHome} />} onClick={() => router.push('/dashboard')}>Inicio</MenuItem>
            <MenuItem icon={<Icon as={FiFileText} />} onClick={() => router.push('/dashboard/contents')}>Contenidos</MenuItem>
            <MenuDivider />
            <MenuItem icon={<Icon as={FiUsers} />} onClick={() => router.push('/dashboard/users')}>Gestión de Usuarios</MenuItem>
          </MenuList>
        </Menu>
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">Administración</Text>
      </HStack>
      <Spacer />
      <HStack spacing={4}>
        <IconButton aria-label="Notificaciones" icon={<FiBell />} size="sm" variant="ghost" />
        <Text fontSize="sm" color="gray.600">{nombre}</Text>
        <Avatar name={nombre} size="sm" />
      </HStack>
    </Flex>
  );
}

export default function ClientDashboard({ children, nombre = 'Administrador' }) {

  return (
    <ChakraProvider>
      <Flex minH="100vh" position="relative" bg="gray.50">
        <Box flex="1" ml={{ base: 0, md: 0 }} transition="margin-left 0.3s">
          <Header nombre={nombre} />
          <Box p={4} bg="white" minH="calc(100vh - 56px)">
            {children}
          </Box>
        </Box>
      </Flex>
    </ChakraProvider>
  );
}
