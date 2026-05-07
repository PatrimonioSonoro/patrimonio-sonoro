"use client";
import React from 'react';
import { ChakraProvider, Box, Flex, HStack, Text, IconButton, Avatar, Spacer, Button, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Icon, useColorModeValue } from '@chakra-ui/react';
import { FiBell, FiChevronDown, FiHome, FiFileText, FiUsers, FiMusic } from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';

// Sidebar intentionally left out to allow full-width admin panel

function Header({ nombre }) {
  const router = useRouter();
  const pathname = usePathname();
  const headerBg = useColorModeValue('white', 'gray.900');
  const headerBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const menuBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const menuShadow = useColorModeValue('0 22px 70px rgba(0,0,0,0.10)', '0 22px 70px rgba(0,0,0,0.35)');
  const menuBg = useColorModeValue('white', 'gray.800');
  const menuItemActiveBg = useColorModeValue('blue.50', 'whiteAlpha.100');
  const menuItemHoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const titleColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const menuButtonBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const menuButtonHoverBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  const sectionLabelColor = useColorModeValue('gray.500', 'whiteAlpha.700');
  const userTextColor = useColorModeValue('gray.600', 'whiteAlpha.700');

  const items = [
    { href: '/dashboard', label: 'Inicio', icon: FiHome },
    { href: '/dashboard/contents', label: 'Contenidos', icon: FiFileText },
    { href: '/dashboard/albums', label: 'Álbumes', icon: FiMusic },
    { href: '/dashboard/mapa-sonoro', label: 'Mapa Sonoro', icon: FiMusic },
  ];
  const adminItems = [{ href: '/dashboard/users', label: 'Gestión de Usuarios', icon: FiUsers }];

  const isActive = (href) => pathname === href || (href !== '/dashboard' && String(pathname || '').startsWith(href));

  return (
    <Flex
      as="header"
      align="center"
      py={2}
      px={4}
      borderBottom="1px"
      borderColor={headerBorder}
      bg={headerBg}
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex="docked"
    >
      <HStack spacing={3}>
        <Menu>
          <MenuButton
            as={Button}
            variant="ghost"
            rightIcon={<FiChevronDown />}
            px={4}
            py={2}
            borderRadius="full"
            bg={menuButtonBg}
            borderWidth="1px"
            borderColor={menuBorder}
            _hover={{ bg: menuButtonHoverBg }}
            _active={{ bg: menuButtonHoverBg }}
          >
            Menú
          </MenuButton>
          <MenuList
            borderRadius="xl"
            py={2}
            px={2}
            bg={menuBg}
            borderWidth="1px"
            borderColor={menuBorder}
            boxShadow={menuShadow}
            minW="260px"
          >
            <Box px={3} pb={2} pt={1}>
              <Text fontSize="xs" fontWeight="800" letterSpacing="0.14em" color={sectionLabelColor}>
                NAVEGACIÓN
              </Text>
            </Box>

            {items.map((it) => (
              <MenuItem
                key={it.href}
                icon={<Icon as={it.icon} />}
                onClick={() => router.push(it.href)}
                borderRadius="lg"
                fontWeight={isActive(it.href) ? '800' : '600'}
                bg={isActive(it.href) ? menuItemActiveBg : 'transparent'}
                _hover={{ bg: menuItemHoverBg }}
                _focus={{ bg: menuItemHoverBg }}
                py={2.5}
              >
                {it.label}
              </MenuItem>
            ))}

            <MenuDivider my={2} borderColor={menuBorder} />
            <Box px={3} pb={2}>
              <Text fontSize="xs" fontWeight="800" letterSpacing="0.14em" color={sectionLabelColor}>
                ADMIN
              </Text>
            </Box>

            {adminItems.map((it) => (
              <MenuItem
                key={it.href}
                icon={<Icon as={it.icon} />}
                onClick={() => router.push(it.href)}
                borderRadius="lg"
                fontWeight={isActive(it.href) ? '800' : '600'}
                bg={isActive(it.href) ? menuItemActiveBg : 'transparent'}
                _hover={{ bg: menuItemHoverBg }}
                _focus={{ bg: menuItemHoverBg }}
                py={2.5}
              >
                {it.label}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        <Text fontSize="lg" fontWeight="800" color={titleColor}>Administración</Text>
      </HStack>
      <Spacer />
      <HStack spacing={4}>
        <IconButton aria-label="Notificaciones" icon={<FiBell />} size="sm" variant="ghost" />
        <Text fontSize="sm" color={userTextColor}>{nombre}</Text>
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
