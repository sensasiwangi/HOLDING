-- =============================================
-- SENSASI WANGI INDONESIA
-- Seed Data Part 2: Additional materials
-- =============================================

-- SWEET/BALSAMIC (continued)
INSERT OR IGNORE INTO raw_materials (no, name, synonym, family, odor_profile, cas_number, chemical_group, note_position, price_per_5ml, price_per_10ml, price_per_50ml, price_per_100ml, price_per_500ml, kategori_rm) VALUES
(310, 'Benzoin Siam Resinoid 50-DPG', NULL, 'Sweet/Balsamic', 'sweet balsamic vanilla amber warm', NULL, 'resinoid', 'base', 30000, 48000, 192000, 307200, 1228800, 'pure'),
(311, 'Benzylidine Acetone', NULL, 'Sweet/Balsamic', 'sweet floral balsamic', NULL, 'ketone', 'middle', 30000, 48000, 192000, 288000, 1008000, 'pure'),
(312, 'Benzylidine Acetone 80% Etha', NULL, 'Sweet/Balsamic', 'sweet floral balsamic diluted', NULL, 'ketone', 'middle', 40000, 64000, 256000, 384000, 1344000, 'pure'),
(313, 'Ethyl Phenyl Acetate', 'Acetic Acid, Phenyl-, Ethyl Ester', 'Sweet/Balsamic', 'sweet floral honey rose balsamic cocoa', '101-97-3', 'ester', 'middle', 19000, 30000, 120000, 175000, 620000, 'pure'),
(314, 'Methyl Benzoate', 'Benzoic Acid Methyl Ester / Clorius', 'Sweet/Balsamic', 'phenolic wintergreen almond floral cananga chemical phenolic cherry', '93-58-3', 'ester', 'middle', 27500, 45000, 175000, 350000, 1225000, 'pure');

-- FRUITY FAMILY
INSERT OR IGNORE INTO raw_materials (no, name, synonym, family, odor_profile, cas_number, chemical_group, note_position, price_per_5ml, price_per_10ml, price_per_50ml, price_per_100ml, price_per_500ml, kategori_rm) VALUES
(320, 'Aldehyde C-14 / Gamma Undecalactone', 'Peach Aldehyde / Abriceine', 'Fruity', 'fruity peach creamy fatty lactonic apricot ketonic coconut', '104-67-6', 'lactone', 'base', 23000, 36000, 146000, 292000, 1022000, 'pure'),
(321, 'Allyl Amyl Glycolate', 'Allyl (3-methylbutoxy)Acetate', 'Fruity', 'fruity green galbanum pineapple fusel', '67634-00-8', 'ester', 'top', 75000, 127500, 612000, 1224000, 4284000, 'pure'),
(322, 'Allyl Heptanoate / Allyl Heptilate', NULL, 'Fruity', 'sweet fruity pineapple banana waxy', '1551-44-2', 'ester', 'top', 16000, 25000, 100000, 150000, 520000, 'pure'),
(323, 'Amyl Butyrate', NULL, 'Fruity', 'fruity banana pear apple', NULL, 'ester', 'top', 11000, 18000, 72000, 112000, 394000, 'pure'),
(324, 'Coconut Lactone / Aldehyde C-18', 'Nonano-1,4-Lactone / Abricolin', 'Fruity', 'coconut creamy waxy sweet buttery oily', '104-61-0', 'lactone', 'base', 24000, 37000, 150000, 300000, 1050000, 'pure'),
(325, 'Creamy Mango Base', NULL, 'Fruity', 'sweet fruity mango creamy tropical', NULL, 'accord', 'middle', 20000, 32000, 128000, 192000, 672000, 'accord'),
(326, 'Dihydroactinidiolide', 'Apricot Furanone', 'Fruity', 'ripe apricot fruity plum berry grape fruit tropical fruit woody', '15356-74-8', 'lactone', 'middle', 65000, 97500, 390000, 585000, 2340000, 'pure'),
(327, 'Dimethyl Benzyl Carbinyl Butyrate', 'DMBC Butyrate', 'Fruity', 'floral green herbal fruity plum prune', '10094-34-5', 'ester', 'middle', 34000, 51000, 204000, 306000, 1224000, 'pure'),
(328, 'Ethyl 2-Methyl Butyrate', 'Berry Butyrate / Cydrane / Dorintha', 'Fruity', 'sharp sweet green apple fruity', '7452-79-1', 'ester', 'top', 15000, 22000, 84000, 165000, 575000, 'pure'),
(329, 'Ethyl Acetoacetate', 'Acetoacetic Ester / EAA', 'Fruity', 'fresh fruity green apple fatty', '141-97-9', 'ester', 'top', 14000, 21000, 83000, 165000, 575000, 'pure'),
(330, 'Ethyl Butyrate', 'Butanoic Acid, Ethyl Ester', 'Fruity', 'fruity juicy fruit fruity pineapple cognac', '105-54-4', 'ester', 'top', 19000, 25000, 105000, 210000, 730000, 'pure'),
(331, 'Ethyl Formate', 'Formic Acid Ethyl Ester / Areginal', 'Fruity', 'ethereal green alcoholic rose cognac', '109-94-4', 'ester', 'top', 25000, 45000, 202500, 405000, 1417500, 'pure'),
(332, 'Ethyl Iso Valerate', 'Isovaleric Acid, Ethyl Ester', 'Fruity', 'fruity sweet apple pineapple tutti frutti', '108-64-5', 'ester', 'top', 15000, 22000, 90000, 180000, 625000, 'pure'),
(333, 'Ethyl Propionate', 'Propionic Acid, Ethyl Ester', 'Fruity', 'sweet fruity rummy juicy fruity grape pineapple', '105-37-3', 'ester', 'top', 12500, 20000, 80000, 128000, 512000, 'pure'),
(334, 'Ethyl Thioacetate', 'S-Ethyl Acetothioate', 'Fruity', 'sulfurous fruity onion garlic meaty coffee', '625-60-5', 'thioester', 'top', 75000, 112500, 450000, 675000, 2700000, 'pure'),
(335, 'Gamma Octalactone / C-8 Lactones', 'Octano-1,4-Lactone', 'Fruity', 'sweet coconut waxy creamy tonka dairy fatty sweet creamy coconut milky soapy coumarinic fruity peach apricot', '104-50-7', 'lactone', 'base', 28000, 42000, 168000, 336000, 1176000, 'pure'),
(336, 'Gamma Decalactone', 'Decano-1,4-Lactone / Peach Aldehyde', 'Fruity', 'fresh oily waxy peach coconut buttery sweet', '706-14-9', 'lactone', 'base', 27500, 45000, 175000, 330000, 1155000, 'pure'),
(337, 'Gamma Undecalactone', 'Undecano-1,4-Lactone / Aldehyde C-14', 'Fruity', 'fruity peach creamy fatty lactonic apricot ketonic coconut', '104-67-6', 'lactone', 'base', 23000, 36000, 146000, 292000, 1022000, 'pure'),
(338, 'Hexalactone Gamma / C-6 Lactones', 'Hexano-1,4-Lactone / Ethyl Butyrolactone', 'Fruity', 'herbal coconut sweet coumarinic tobacco sweet creamy lactonic tobacco coumarinic green coconut', '0695-06-07', 'lactone', 'base', 28000, 42000, 168000, 336000, 1176000, 'pure'),
(339, 'Hexanoic Acid', 'Caproic Acid / Butyl Acetic Acid', 'Fruity', 'sour fatty sweaty cheesy', '142-62-1', 'acid', 'top', 25000, 40000, 160000, 320000, 1120000, 'pure'),
(340, 'Iso Amyl Butyrate', '3-Methylbutyl Butyrate', 'Fruity', 'fruity green apricot pear banana fruity sweet estery green tropical apple melon tutti frutti', '106-27-4', 'ester', 'top', 11000, 18000, 72000, 112000, 394000, 'pure'),
(341, 'Iso Amyl Formate', 'Isopentyl Formate', 'Fruity', 'plum currant black currant ethereal cortex dry earthy fruity green sharp green estery apple waxy', '110-45-2', 'ester', 'top', 40000, 72000, 324000, 648000, 2268000, 'pure'),
(342, 'Iso Amyl Iso Valerate', 'Isopentyl Isovalerate', 'Fruity', 'sweet fruity green ripe apple jammy tropical sweet fruity green apple estery', '659-70-1', 'ester', 'top', 15000, 20000, 90000, 179000, 629000, 'pure'),
(343, 'Methyl Anthranilate', 'Benzoic Acid, 2-Amino-, Methyl Ester', 'Fruity', 'fruity grape orangeflower neroli fruity grape musty floral powdery', '134-20-3', 'ester', 'top', 24000, 40800, 180039, 360078, 1260000, 'pure'),
(344, 'Methyl Heptenone', NULL, 'Fruity', 'fruity citrus green herbal', NULL, 'ketone', 'top', 30000, 48000, 192000, 384000, 1344000, 'pure'),
(345, 'Octalactone Delta / C-8 Lactones', 'Delta-Octalactone', 'Fruity', 'sweet fatty coconut tonka tropical dairy sweet coconut creamy coumarinic lactonic green fatty', '698-76-0', 'lactone', 'base', 36000, 54000, 216000, 432000, 1512000, 'pure'),
(346, 'Strawberry Furanone / Furaneol', 'Strawberry Furanone / Carmelan', 'Fruity', 'sweet cotton candy caramellic strawberry sugar brown sugar', '3658-77-3', 'furanone', 'middle', 40000, 64000, 256000, 384000, 1344000, 'pure');

-- ════════════════════════════════════════════
-- ANIMALIC FAMILY
-- ════════════════════════════════════════════

INSERT OR IGNORE INTO raw_materials (no, name, synonym, family, odor_profile, cas_number, chemical_group, note_position, price_per_5ml, price_per_10ml, price_per_50ml, price_per_100ml, price_per_500ml, kategori_rm) VALUES
(350, 'Ambroxan', NULL, 'Animalic', 'warm ambergris woody musk sweet', '106119-57-7', 'oxide', 'base', 135000, 220000, 990000, 1881000, 7524000, 'pure'),
(351, 'Cetone V / Allyl Ionone', 'Tropical Ionone / Allyl-Alpha-Ionone', 'Animalic', 'green floral woody orris tropical weedy waxy leathery', '79-78-7', 'ketone', 'middle', 150000, 240000, 960000, 1440000, 5040000, 'pure'),
(352, 'Civet Accord', NULL, 'Animalic', 'animalic warm fecal musk', NULL, 'accord', 'base', 125000, 205000, 810000, 1225000, 4300000, 'accord'),
(353, 'Ethylene Brassylate / Musk T', '1,11-Undecanedicarboxylic Acid Ester / Astratone', 'Animalic', 'powdery sweet floral ambrette musk woody', '105-95-3', 'ester', 'base', 18500, 33300, 133200, 266400, 932400, 'pure'),
(354, 'Galaxolide Pure 100% / Musk GX', 'Musk GX 100% / Astrolide', 'Animalic', 'sweet floral musk', '1222-05-5', 'synthetic_musk', 'base', 10000, 16000, 65000, 115000, 400000, 'pure'),
(355, 'Globanone', 'Musk Dec-8-Enone / Animusk / Musk Banone', 'Animalic', 'musk cloth laundered cloth dry balsamic waxy animal floral tobacco', '3100-36-5', 'ketone', 'base', 95000, 161500, 759050, 1214480, 5465160, 'pure'),
(356, 'Habanolide', '(E)-12-Musk Decenone', 'Animalic', 'sweet musk waxy dry powdery cloth laundered cloth metallic animal tropical', '111879-80-2', 'ketone', 'base', 85000, 136000, 544000, 816000, 3264000, 'pure'),
(357, 'Helvetolide', 'Musk Propanoate / Herbactolide', 'Animalic', 'musk ambrette fruity pear woody floral', '141773-73-1', 'ester', 'base', 168000, 270000, 1242000, 2359800, 8259300, 'pure'),
(358, 'Indole', '1H-Indole / Azaindole / Benzazole', 'Animalic', 'animal floral naphthyl fecal pungent floral naphthyl fecal animal musty', '120-72-9', 'indole', 'middle', 52000, 83000, 330000, 499000, 1747000, 'pure'),
(359, 'Macrolide', 'Omega-Pentadecalactone / Pentalide', 'Animalic', 'musk animal powdery natural fruity', '106-02-5', 'lactone', 'base', 102000, 178500, 714000, 1428000, 4998000, 'pure'),
(360, 'Musk Ketone', NULL, 'Animalic', 'sweet musk powdery', '81-14-1', 'nitro_musk', 'base', 20000, 32000, 128000, 256000, 896000, 'pure'),
(361, 'Musk Xylene', NULL, 'Animalic', 'sweet musk powdery waxy', '81-15-2', 'nitro_musk', 'base', 15000, 24000, 96000, 192000, 672000, 'pure'),
(362, 'Exaltolide / Pentadecanolide', 'Omega-Pentadecalactone / Muscolactone', 'Animalic', 'musk animal powdery natural fruity', '106-02-5', 'lactone', 'base', 47000, 75000, 262500, 450000, 1575000, 'pure');

-- ════════════════════════════════════════════
-- MINERAL FAMILY
-- ════════════════════════════════════════════

INSERT OR IGNORE INTO raw_materials (no, name, synonym, family, odor_profile, cas_number, chemical_group, note_position, price_per_5ml, price_per_10ml, price_per_50ml, price_per_100ml, price_per_500ml, kategori_rm) VALUES
(370, 'Floralozone / Ozone Propanal', 'Ozone Propanal / Florazon / Ozofloranal', 'Mineral', 'ozone clean fresh green marine', '67634-15-5', 'aldehyde', 'top', 140000, 215000, 860000, 1462000, 5848000, 'pure'),
(371, 'Floralozone / Ozone Propanal 10-TEC', NULL, 'Mineral', 'ozone clean fresh green marine diluted', NULL, 'aldehyde', 'top', 30000, 51000, 239700, 383520, 1725840, 'pure'),
(372, 'Florol', 'Floral Pyranol / Floriffol / Florosa / Rosanol', 'Mineral', 'fresh clean natural floral muguet bois de rose', '63500-71-0', 'alcohol', 'middle', 110000, 185000, 740000, 1258000, 5032000, 'pure'),
(373, 'Helional', 'Ocean Propanal / Aquanal / Neohelial', 'Mineral', 'watery fresh green ozone cyclamen hay', '1205-17-0', 'aldehyde', 'middle', 44000, 70400, 246400, 492800, 1724800, 'pure'),
(374, 'Marine Accord', NULL, 'Mineral', 'fresh aquatic salty watery', NULL, 'accord', 'top', 65000, 104000, 468000, 936000, 3276000, 'accord'),
(375, 'Melonal', 'Melon Heptenal / Melomor', 'Mineral', 'fresh ozone melon watermelon sweet clean green green sweet oily melon watermelon rind floral', '106-72-9', 'aldehyde', 'top', 90000, 144000, 576000, 1152000, 4032000, 'pure'),
(376, 'Menthol Crystal', 'DL-Menthol', 'Mineral', 'cooling mentholic minty', '1490-04-06', 'alcohol', 'top', 30000, 48000, 192000, 384000, 1344000, 'pure'),
(377, 'Menthyl Lactate', NULL, 'Mineral', 'soft cooling minty creamy fresh smooth gentle long-lasting cooling', '17162-29-7', 'ester', 'top', 45000, 67500, 270000, 540000, 1890000, 'pure'),
(378, 'Ocean Accord', NULL, 'Mineral', 'watery marine salty airy ozonic fresh sea breeze ocean mist', NULL, 'accord', 'top', 65000, 104000, 416000, 832000, 2912000, 'accord'),
(379, 'Ozone Accord', NULL, 'Mineral', 'fresh citrussy airy ozonic', NULL, 'accord', 'top', 65000, 104000, 468000, 936000, 3276000, 'accord');

-- ════════════════════════════════════════════
-- INDUSTRIAL / SOLVENT / CARRIER
-- ════════════════════════════════════════════

INSERT OR IGNORE INTO raw_materials (no, name, synonym, family, odor_profile, cas_number, chemical_group, note_position, price_per_5ml, price_per_10ml, price_per_50ml, price_per_100ml, price_per_500ml, kategori_rm) VALUES
(380, 'DPG / Dipropylene Glycol', 'Dipropyleneglycol', 'Industrial', 'soft alcoholic odorless carrier', '25265-71-8', 'solvent', 'base', 2360, 3540, 12390, 24780, 86730, 'solvent'),
(381, 'Ethanol 96% FG', 'Ethanol Food Grade 96%', 'Industrial', 'alcoholic carrier volatile', '64-17-5', 'solvent', 'base', 4000, 6400, 15000, 25000, 55000, 'solvent'),
(382, 'Eco Cutter Base', 'Specialty ECO C Base', 'Industrial', 'very light slightly sweet-oily neutral odor dilution carrier', NULL, 'base', 'base', 21500, 32250, 112875, 225750, 790125, 'eco_base'),
(383, 'Eco Moisturizer Perfume', 'Specialty ECO M Base', 'Industrial', 'soft creamy watery skin-like profile smooth moisturized', NULL, 'base', 'base', 25000, 40000, 160000, 320000, 1120000, 'eco_base'),
(384, 'Eco Perfume Base', 'Specialty ECO Base', 'Industrial', 'neutral clean soft alcoholic transparent carrier-like', NULL, 'base', 'base', 50000, 85000, 298000, 596000, 2086000, 'eco_base'),
(385, 'Benzyl Benzoate', NULL, 'Industrial', 'faint balsamic solvent carrier', '100-61-4', 'solvent', 'base', 9000, 16000, 58000, 116000, 403000, 'solvent'),
(386, 'Triethyl Citrate / TEC', NULL, 'Industrial', 'odorless carrier solvent', '77-93-0', 'solvent', 'base', 5000, 8000, 32000, 64000, 224000, 'solvent');

-- ════════════════════════════════════════════
-- WHITE FLORAL & SPECIALTY NOTES
-- ════════════════════════════════════════════

INSERT OR IGNORE INTO raw_materials (no, name, synonym, family, odor_profile, cas_number, chemical_group, note_position, price_per_5ml, price_per_10ml, price_per_50ml, price_per_100ml, price_per_500ml, kategori_rm) VALUES
(390, 'Hydroxycitronellal', '3,7-Dimethyl-7-Hydroxyoctanal / Laurinal', 'Floral', 'floral lily sweet green waxy tropical melon', '107-75-5', 'aldehyde', 'middle', 50000, 75000, 270000, 459000, 1606500, 'pure'),
(391, 'Lilial / Lilyall', 'Aldehyde MBDC / Mefloral / Lysmeral', 'Floral', 'floral muguet watery green powdery cumin', '80-54-6', 'aldehyde', 'middle', 36000, 60000, 230000, 460000, 1610000, 'pure'),
(392, 'Phenethyl Alcohol', '2-Phenylethanol', 'Floral', 'sweet floral rose honey rosy', '60-12-8', 'alcohol', 'middle', 15000, 24000, 96000, 192000, 672000, 'pure'),
(393, 'Tuberose Accord', NULL, 'Floral', 'intense white floral creamy waxy narcotic sweet', NULL, 'accord', 'middle', 80000, 128000, 512000, 1024000, 3584000, 'accord'),
(394, 'Ylang Ylang Oil', 'Cananga Odorata Oil', 'Floral', 'sweet floral jasmine fruity creamy tropical', '8008-20-6', 'essential_oil', 'middle', 65000, 104000, 416000, 832000, 2912000, 'pure');

-- ════════════════════════════════════════════
-- ACCORDS (Pre-made blends)
-- ════════════════════════════════════════════

INSERT OR IGNORE INTO raw_materials (no, name, synonym, family, odor_profile, cas_number, chemical_group, note_position, price_per_5ml, price_per_10ml, price_per_50ml, price_per_100ml, price_per_500ml, kategori_rm) VALUES
(400, 'Amber Accord', NULL, 'Sweet/Balsamic', 'warm amber sweet balsamic', NULL, 'accord', 'base', 55000, 85000, 340000, 510000, 1530000, 'accord'),
(401, 'Base Citrus Animalic', NULL, 'Citrus', 'citrus animalic leathery', NULL, 'eco_base', 'middle', 20000, 32000, 128000, 192000, 672000, 'eco_base'),
(402, 'Base Fresh Peony', NULL, 'Floral', 'fresh peony floral green', NULL, 'eco_base', 'middle', 20000, 32000, 128000, 192000, 672000, 'eco_base'),
(403, 'Base Jasmine Tea', NULL, 'Floral', 'jasmine tea floral green', NULL, 'eco_base', 'middle', 20000, 32000, 128000, 192000, 672000, 'eco_base'),
(404, 'Base Leather Spicy', NULL, 'Woody', 'leather spicy woody', NULL, 'eco_base', 'base', 30000, 48000, 192000, 288000, 1008000, 'eco_base'),
(405, 'Base Rose', NULL, 'Floral', 'sweet rosy floral', NULL, 'eco_base', 'middle', 30000, 48000, 192000, 288000, 1008000, 'eco_base'),
(406, 'Base Sultan Oud', NULL, 'Woody', 'oud woody amber balsamic', NULL, 'eco_base', 'base', 30000, 48000, 192000, 288000, 1008000, 'eco_base'),
(407, 'Base Tuberose White Floral', NULL, 'Floral', 'white floral tuberose creamy', NULL, 'eco_base', 'middle', 40000, 64000, 256000, 384000, 1344000, 'eco_base'),
(408, 'Chocolate Accord', NULL, 'Sweet/Balsamic', 'chocolate sweet cocoa brown', NULL, 'accord', 'middle', 65000, 104000, 416000, 748800, 3369600, 'accord'),
(409, 'Dry Fruit Accord', NULL, 'Fruity', 'sweet fruity berry dried fruit', NULL, 'accord', 'middle', 130000, 208000, 832000, 1248000, 4368000, 'accord'),
(410, 'Fougere Accord', NULL, 'Herbal', 'aromatic lavender herbal mossy woody powdery barbershop', NULL, 'accord', 'middle', 65000, 104000, 416000, 748800, 3369600, 'accord'),
(411, 'Frangipani Accord', NULL, 'Floral', 'sweet tropical floral frangipani jasmine', NULL, 'accord', 'middle', 123000, 197000, 789000, 1185000, 4100000, 'accord'),
(412, 'Green Apple Accord', NULL, 'Fruity', 'fresh green apple crisp', NULL, 'accord', 'top', 20000, 32000, 128000, 192000, 672000, 'accord'),
(413, 'Lilly of the Valley Accord', NULL, 'Floral', 'lily of the valley muguet floral waxy green aldehydic herbal powdery', NULL, 'accord', 'middle', 65000, 104000, 468000, 936000, 3276000, 'accord'),
(414, 'Marine Accord', NULL, 'Mineral', 'fresh aquatic salty watery oceanic', NULL, 'accord', 'top', 65000, 104000, 468000, 936000, 3276000, 'accord'),
(415, 'Ozone Accord', NULL, 'Mineral', 'fresh citrussy airy ozonic', NULL, 'accord', 'top', 65000, 104000, 468000, 936000, 3276000, 'accord');
