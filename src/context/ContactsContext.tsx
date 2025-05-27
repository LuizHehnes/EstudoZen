import React, { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  role: 'professor' | 'monitor' | 'coordenador';
  notes: string;
  createdAt: Date;
}

interface ContactsContextType {
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Promise<void>;
  updateContact: (id: string, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  getContactById: (id: string) => Contact | undefined;
  getContactsBySubject: (subject: string) => Contact[];
  searchContacts: (query: string) => Contact[];
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const useContacts = () => {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error('useContacts deve ser usado dentro de um ContactsProvider');
  }
  return context;
};

interface ContactsProviderProps {
  children: React.ReactNode;
}

export const ContactsProvider: React.FC<ContactsProviderProps> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const savedContacts = await localforage.getItem<Contact[]>('contacts');
      if (savedContacts) {
        // converter strings de data de volta para objetos Date
        const parsedContacts = savedContacts.map(contact => ({
          ...contact,
          createdAt: new Date(contact.createdAt)
        }));
        setContacts(parsedContacts);
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    }
  };

  const saveContacts = async (newContacts: Contact[]) => {
    try {
      await localforage.setItem('contacts', newContacts);
      setContacts(newContacts);
    } catch (error) {
      console.error('Erro ao salvar contatos:', error);
    }
  };

  const addContact = async (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    const newContact: Contact = {
      ...contactData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    const newContacts = [...contacts, newContact];
    await saveContacts(newContacts);
  };

  const updateContact = async (id: string, contactData: Partial<Contact>) => {
    const newContacts = contacts.map(contact =>
      contact.id === id ? { ...contact, ...contactData } : contact
    );
    await saveContacts(newContacts);
  };

  const deleteContact = async (id: string) => {
    const newContacts = contacts.filter(contact => contact.id !== id);
    await saveContacts(newContacts);
  };

  const getContactById = (id: string) => {
    return contacts.find(contact => contact.id === id);
  };

  const getContactsBySubject = (subject: string) => {
    return contacts.filter(contact => 
      contact.subject.toLowerCase().includes(subject.toLowerCase())
    );
  };

  const searchContacts = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(lowercaseQuery) ||
      contact.email.toLowerCase().includes(lowercaseQuery) ||
      contact.subject.toLowerCase().includes(lowercaseQuery) ||
      contact.role.toLowerCase().includes(lowercaseQuery)
    );
  };

  return (
    <ContactsContext.Provider value={{
      contacts,
      addContact,
      updateContact,
      deleteContact,
      getContactById,
      getContactsBySubject,
      searchContacts
    }}>
      {children}
    </ContactsContext.Provider>
  );
}; 