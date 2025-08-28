

import { useEffect, useState, useRef } from "react";
export interface Province {
  code: string;
  name: string;
  division_type: string;
  codename: string;
  phone_code: string;
}

export interface District {
  code: string;
  name: string;
  division_type: string;
  codename: string;
  province_code: string;
}

export interface Ward {
  code: string;
  name: string;
  division_type: string;
  codename: string;
  district_code: string;
}

export default function AddressSelector({ value, onChange }: {
  value?: string;
  onChange: (fullAddress: string) => void;
}) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [street, setStreet] = useState("");

  const [isProvinceOpen, setIsProvinceOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [isWardOpen, setIsWardOpen] = useState(false);

  const provinceRef = useRef<HTMLDivElement>(null);
  const districtRef = useRef<HTMLDivElement>(null);
  const wardRef = useRef<HTMLDivElement>(null);


  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const hasParsedValue = useRef(false);

  const lastSentValue = useRef('');

  useEffect(() => {
    hasParsedValue.current = false;
    lastSentValue.current = ''; 
  }, [value]);

 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (provinceRef.current && !provinceRef.current.contains(event.target as Node)) {
        setIsProvinceOpen(false);
      }
      if (districtRef.current && !districtRef.current.contains(event.target as Node)) {
        setIsDistrictOpen(false);
      }
      if (wardRef.current && !wardRef.current.contains(event.target as Node)) {
        setIsWardOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetch(`http://localhost:3000/api/provinces`)
      .then(res => res.json())
      .then(setProvinces);
  }, []);

  useEffect(() => {
    if (province) {
      fetch(`http://localhost:3000/api/districts/${province}`)
        .then(res => res.json())
        .then(setDistricts);
      setDistrict('');
      setWard('');
      setWards([]);
    } else {
      setDistricts([]);
      setDistrict('');
      setWard('');
      setWards([]);
    }
  }, [province]);

  useEffect(() => {
    if (district) {
      fetch(`http://localhost:3000/api/wards/${district}`)
        .then(res => res.json())
        .then(setWards);
      setWard('');
    } else {
      setWards([]);
      setWard('');
    }
  }, [district]);

  useEffect(() => {
    if (value && provinces.length > 0 && !hasParsedValue.current) {
      const addressParts = value.split(', ').reverse(); 
      
      const provinceName = addressParts[0];
      const foundProvince = provinces.find(p => p.name === provinceName);
      if (foundProvince) {
        setProvince(foundProvince.code);
      }
      
      hasParsedValue.current = true;
    }
  }, [value, provinces]); 

  useEffect(() => {
    if (value && districts.length > 0 && hasParsedValue.current) {
      const addressParts = value.split(', ').reverse();
      const districtName = addressParts[1];
      if (districtName) {
        const foundDistrict = districts.find(d => d.name === districtName);
        if (foundDistrict) {
          setDistrict(foundDistrict.code);
        }
      }
    }
  }, [value, districts]);

  useEffect(() => {
    if (value && wards.length > 0 && hasParsedValue.current) {
      const addressParts = value.split(', ').reverse();
      const wardName = addressParts[2];
      if (wardName) {
        const foundWard = wards.find(w => w.name === wardName);
        if (foundWard) {
          setWard(foundWard.code);
        }
      }
      
      const streetAddress = addressParts.slice(3).reverse().join(', ');
      if (streetAddress) {
        setStreet(streetAddress);
      }
    }
  }, [value, wards]);

  const CustomDropdown = ({
    items,
    selected,
    onSelect,
    placeholder,
    isOpen,
    setIsOpen,
    ref,
  }: {
    items: { name: string; code: string }[];
    selected: { name: string; code: string } | null;
    onSelect: (value: { name: string; code: string }) => void;
    placeholder: string;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    ref: React.RefObject<HTMLDivElement | null>;
  }) => (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        className="relative w-full cursor-pointer rounded-lg border border-gray-300 bg-white py-2 pl-4 pr-10 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 hover:border-red-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="block truncate text-gray-800">
          {selected ? selected.name : placeholder}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {items.map((item) => (
            <div
              key={item.code}
              className="relative cursor-pointer select-none py-2 pl-10 pr-4 hover:bg-red-100 hover:text-red-700 transition"
              onClick={() => {
                onSelect(item);
                setIsOpen(false);
              }}
            >
              <span className={`block truncate ${
                selected?.code === item.code ? "font-semibold text-red-600" : "font-normal"
              }`}>
                {item.name}
              </span>
              {selected?.code === item.code && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-600">
                  ✔
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const provinceName = provinces.find((p) => p.code === province)?.name || "";
  const districtName = districts.find((d) => d.code === district)?.name || "";
  const wardName = wards.find((w) => w.code === ward)?.name || "";

  
  useEffect(() => {
    const full = [street, wardName, districtName, provinceName].filter(Boolean).join(", ");
    
    if (full !== lastSentValue.current && full.trim() !== '') {
      lastSentValue.current = full;
      setTimeout(() => {
        onChangeRef.current(full);
      }, 0);
    }
  }, [street, wardName, districtName, provinceName]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CustomDropdown
          items={provinces}
          selected={provinces.find((p) => p.code === province) || null}
          onSelect={(p) => setProvince(p.code)}
          placeholder="Chọn tỉnh"
          isOpen={isProvinceOpen}
          setIsOpen={setIsProvinceOpen}
          ref={provinceRef}
        />

        <CustomDropdown
          items={districts}
          selected={districts.find((d) => d.code === district) || null}
          onSelect={(d) => setDistrict(d.code)}
          placeholder="Chọn huyện"
          isOpen={isDistrictOpen}
          setIsOpen={setIsDistrictOpen}
          ref={districtRef}
        />

        <CustomDropdown
          items={wards}
          selected={wards.find((w) => w.code === ward) || null}
          onSelect={(w) => setWard(w.code)}
          placeholder="Chọn xã"
          isOpen={isWardOpen}
          setIsOpen={setIsWardOpen}
          ref={wardRef}
        />
      </div>

      <input
        type="text"
        placeholder="Số nhà, tên đường (VD: 123 Lý Thường Kiệt, Block A2)"
        className={`w-full rounded-lg border px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${
          street.trim() === '' ? 'border-red-300 focus:border-red-400' : 'border-gray-300 focus:border-red-400'
        }`}
        value={street}
        onChange={(e) => {
          e.preventDefault();
          setStreet(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
        onBlur={() => {
          if (street.trim() === '') {

          }
        }}
      />
   
    </div>
  );
}
